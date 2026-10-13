import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroConsulta } from '../../interface/filtros.model';
import {
  ConsultaOut,
  ConsultaUpdate,
  ConsultasIdPaciente,
  Indicador,
  RegistroConsultaCreate,
  RegistroConsultaResponse,
  TotalesItem,
  TotalesResponse,
  ConsultaListResponse,
  PacienteBuscado,
} from '../../interface/consultas';
import { OfflineDatabaseService } from '../../service/offline-database.service';
import { FullSyncService } from '../../service/full-sync.service';

/** Centraliza las operaciones de consulta, admisión y ciclos de atención. */
@Injectable({ providedIn: 'root' })
export class ConsultaService extends BaseApiService {

  private offlineDb = inject(OfflineDatabaseService);
  private fullSync = inject(FullSyncService);

  private consultasSubject = new BehaviorSubject<ConsultaOut[]>([]);
  consultas$ = this.consultasSubject.asObservable();

  private pacienteBuscadoSubject = new BehaviorSubject<PacienteBuscado[]>([]);
  pacientes$ = this.pacienteBuscadoSubject.asObservable();

  private ordenesSubject = new BehaviorSubject<any>({});
  ordenes$ = this.ordenesSubject.asObservable();

  private ultimoFiltroConsulta: PaginationState = {
    filtro: { skip: 0, limit: 8 }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private refrescarConsultas(): void {
    this.getConsultas(this.ultimoFiltroConsulta.filtro).subscribe();
  }

  private async getConsultasOffline(filtros: any): Promise<ConsultaListResponse> {
    const { skip = 0, limit = 8 } = filtros;
    let consultas = await this.offlineDb.getAllConsultas();

    if (filtros.ultimo_estado) {
      consultas = consultas.filter(c => c.ultimo_estado === filtros.ultimo_estado);
    }

    const total = consultas.length;
    const paginadas = consultas.slice(skip, skip + limit);
    return { total, consultas: paginadas };
  }

  enviarOrdenes(ordenes: any): void {
    this.ordenesSubject.next(ordenes);
  }

  getConsultas(filtros: any): Observable<ConsultaListResponse> {
    let { skip = 0, limit = 500 } = filtros.filtro || {};
    skip = Math.max(0, skip);
    limit = Math.min(Math.max(1, limit), 500);
    const filteredFiltros = { ...filtros, filtro: { skip, limit, ...(filtros.filtro || {}) } };
    this.ultimoFiltroConsulta.filtro = filteredFiltros.filtro;

    const params = this.limpiarParametros(filteredFiltros.filtro);

    if (!this.sync.isOnline()) {
      return from(this.getConsultasOffline(filteredFiltros.filtro)).pipe(
        tap(response => this.consultasSubject.next(response.consultas))
      );
    }

    return this.http.get<ConsultaListResponse>(`${this.baseUrl}/consultas/`, { params }).pipe(
      tap(response => {
        this.consultasSubject.next(response.consultas);
        this.offlineDb.saveConsultas(response.consultas);
        for (const c of response.consultas) {
          this.offlineDb.guardarConsultaConsultada(c).catch(err =>
            console.warn('Error guardando consulta consultada offline', err)
          );
        }
      }),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
return from(this.getConsultasOffline(filteredFiltros.filtro)).pipe(
            tap(response => this.consultasSubject.next(response.consultas))
          );
        }
        return this.manejarError(error, 'obtener consultas');
      })
    );
  }

  getConsultasActivas(filtros: FiltroConsulta): Observable<ConsultaListResponse> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    if (!this.sync.isOnline()) {
      return from(this.getConsultasOffline(filtros)).pipe(
        tap(response => this.consultasSubject.next(response.consultas))
      );
    }

    return this.http.get<ConsultaListResponse>(`${this.baseUrl}/consultas/activas`, { params }).pipe(
      tap(response => {
        this.consultasSubject.next(response.consultas);
        this.offlineDb.saveConsultas(response.consultas);
        for (const c of response.consultas) {
          this.offlineDb.guardarConsultaConsultada(c).catch(err =>
            console.warn('Error guardando consulta consultada offline', err)
          );
        }
      }),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.getConsultasOffline(filtros)).pipe(
            tap(response => this.consultasSubject.next(response.consultas))
          );
        }
        return this.manejarError(error, 'obtener consultas activas');
      })
    );
  }

  getConsultasPorPaciente(
    pacienteId: number,
    filtros?: FiltroConsulta
  ): Observable<ConsultasIdPaciente[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros ?? {});

    if (!this.sync.isOnline()) {
      return from(this.offlineDb.getConsultasByPacienteId(pacienteId)).pipe(
        map(lista => lista.map(c => ({
          id: c.id,
          tipo_consulta: c.tipo_consulta!,
          documento: c.documento,
          especialidad: c.especialidad!,
          servicio: c.servicio,
          fecha_consulta: c.fecha_consulta!,
          hora_consulta: c.hora_consulta!,
          ultimo_estado: c.ultimo_estado,
        }))),
        tap(response => this.consultasSubject.next(response as any))
      );
    }

    const url = `${this.baseUrl}/consultas/pacienteId/${pacienteId}`;
    return this.http.get<ConsultasIdPaciente[]>(url, { params }).pipe(
      tap(response => this.consultasSubject.next(response as any)),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.offlineDb.getConsultasByPacienteId(pacienteId)).pipe(
            map(lista => lista.map(c => ({
              id: c.id,
              tipo_consulta: c.tipo_consulta!,
              documento: c.documento,
              especialidad: c.especialidad!,
              servicio: c.servicio,
              fecha_consulta: c.fecha_consulta!,
              hora_consulta: c.hora_consulta!,
              ultimo_estado: c.ultimo_estado,
            }))),
            tap(response => this.consultasSubject.next(response as any))
          );
        }
        return this.manejarError(error, 'obtener consultas por paciente');
      })
    );
  }

  getConsulta(filtros: FiltroConsulta): Observable<ConsultaOut | null> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/consultas/`, params);
    return this.cacheGet(key,
      this.http.get<ConsultaOut[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
        map(consultas => consultas?.length > 0 ? consultas[0] : null),
        catchError(error => this.manejarError(error, 'obtener consulta'))
      )
    );
  }

  getConsultaId(consultaId: number): Observable<ConsultaOut> {
    if (!this.sync.isOnline()) {
      return from(this.offlineDb.getConsultaById(consultaId)).pipe(
        map(c => { if (!c) throw new Error('Consulta no encontrada offline'); return c; })
      );
    }

    const url = `${this.baseUrl}/consultas/${consultaId}`;
    return this.http.get<ConsultaOut>(url).pipe(
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.offlineDb.getConsultaById(consultaId)).pipe(
            map(c => { if (!c) throw error; return c; })
          );
        }
        return this.manejarError(error, 'obtener consulta por ID');
      })
    );
  }

  registrarAdmision(datos: RegistroConsultaCreate): Observable<RegistroConsultaResponse> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/consultas/registro`, datos).pipe(
      tap(() => this.refrescarConsultas()),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteConsulta(consultaId: number): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/consultas/${consultaId}/eliminar`).pipe(
      tap(() => this.refrescarConsultas()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateConsulta(consultaId: number, datos: ConsultaUpdate): Observable<ConsultaOut> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/consultas/${consultaId}`, datos).pipe(
      tap(() => this.refrescarConsultas()),
      finalize(() => this.isLoading.set(false))
    );
  }

  getTotales(fecha?: string): Observable<TotalesResponse> {
    const params = fecha ? this.limpiarParametros({ fecha }) : undefined;
    const url = `${this.baseUrl}/totales/`;
    const key = this.cacheKey(url, params);
    return this.cacheGet(key,
      this.http.get<TotalesResponse>(url, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener totales'))
      ),
      5 * 60 * 1000
    );
  }

  getTotalesArray(fecha?: string): Observable<TotalesItem[]> {
    return this.getTotales(fecha).pipe(
      map(response => response.totales)
    );
  }

  reasignarPaciente(consultaId: number, nuevoPacienteId: number): Observable<ConsultaOut> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/consultas/${consultaId}/reasignar-paciente?nuevo_paciente_id=${nuevoPacienteId}`;
    return this.offMutation('PATCH', url).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  getPacientesBuscados(filtros: any): Observable<PacienteBuscado[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/consultas/buscarpaciente`, params);
    return this.cacheGet(key,
      this.http.get<PacienteBuscado[]>(`${this.baseUrl}/consultas/buscarpaciente`, { params }).pipe(
        tap(pacientes => this.pacienteBuscadoSubject.next(pacientes)),
        catchError(error => this.manejarError(error, 'obtener consultas'))
      )
    );
  }

  /** Guarda una consulta en la tabla de consultados (para offline + límite 500). */
  async guardarConsultaConsultada(consulta: ConsultaOut): Promise<void> {
    await this.offlineDb.consultas_consultados.add(consulta);
    // Mantener solo los últimos 500
    const count = await this.offlineDb.consultas_consultados.count();
    if (count > 500) {
      const all = await this.offlineDb.consultas_consultados.toArray();
      // Eliminar los más antiguos (menor id)
      const toDelete = all.slice(0, count - 500);
      await Promise.all(toDelete.map(c => this.offlineDb.consultas_consultados.delete(c.id)));
    }
  }

  /** Carga los primeros 500 consultas desde el API y los guarda en caché reciente. */
  async loadInitialConsultas(limit: number = 500): Promise<ConsultaListResponse> {
    const response = await this.http.get<ConsultaListResponse>(
      `${this.baseUrl}/consultas/ultimos?limit=${limit}`
    ).toPromise();
    if (response && response.consultas) {
      // Guardar en tabla de consultas (cache general)
      await this.offlineDb.saveConsultas(response.consultas);
      // Guardar en tabla de consultados (historial de consultas usuario)
      for (const c of response.consultas) {
        c._fuente = 'initial_load' as const;
        await this.offlineDb.guardarConsultaConsultada(c).catch(err =>
          console.warn('Error guardando consulta consultada offline', err)
        );
      }
    }
    return response || { total: 0, consultas: [] };
  }
}
