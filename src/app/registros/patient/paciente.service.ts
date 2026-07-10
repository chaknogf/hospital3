// paciente.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';

import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { Paciente, PacienteListResponse, Hijode, PacienteJoin } from '../../interface/interfaces';
import { CitaResponse } from '../../interface/citas';
import { OfflineDatabaseService } from '../../service/offline-database.service';
import { FullSyncService } from '../../service/full-sync.service';

@Injectable({ providedIn: 'root' })
export class PacienteService extends BaseApiService {

  private offlineDb = inject(OfflineDatabaseService);
  private fullSync = inject(FullSyncService);

  // ======= BEHAVIOR SUBJECTS =======
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  pacientes$ = this.pacientesSubject.asObservable();

  // ======= ESTADO DE PAGINACIÓN =======
  private ultimoFiltroPaciente: PaginationState = {
    filtro: { skip: 0, limit: 14 }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ======= PRIVADOS =======

  private refrescarPacientes(): void {
    this.getPacientes(this.ultimoFiltroPaciente.filtro).subscribe();
  }

  private async getPacientesOffline(filtros: any): Promise<PacienteListResponse> {
    const { skip = 0, limit = 14 } = filtros;
    let pacientes = await this.offlineDb.getAllPacientes();

    if (filtros.q) {
      pacientes = await this.offlineDb.searchPacientesLocal(filtros.q);
    }

    const total = pacientes.length;
    const paginados = pacientes.slice(skip, skip + limit);
    return { total, pacientes: paginados };
  }

  // ======= CRUD PACIENTES =======

  getPacientes(filtros: any): Observable<PacienteListResponse> {
    this.ultimoFiltroPaciente.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    if (!this.sync.isOnline()) {
      return from(this.getPacientesOffline(filtros)).pipe(
        tap(response => this.pacientesSubject.next(response.pacientes))
      );
    }

    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/`, { params }).pipe(
      tap(response => {
        this.pacientesSubject.next(response.pacientes);
        this.offlineDb.savePacientes(response.pacientes);
      }),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.getPacientesOffline(filtros)).pipe(
            tap(response => this.pacientesSubject.next(response.pacientes))
          );
        }
        return this.manejarError(error, 'obtener pacientes');
      })
    );
  }

  buscarPaciente(q: any): Observable<PacienteListResponse> {
    const params = this.limpiarParametros(q);

    if (!this.sync.isOnline()) {
      return from(this.getPacientesOffline(q)).pipe(
        tap(response => this.pacientesSubject.next(response.pacientes))
      );
    }

    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/buscar/`, { params }).pipe(
      tap(response => {
        this.pacientesSubject.next(response.pacientes);
        this.offlineDb.savePacientes(response.pacientes);
      }),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.getPacientesOffline(q)).pipe(
            tap(response => this.pacientesSubject.next(response.pacientes))
          );
        }
        return this.manejarError(error, 'buscar pacientes');
      })
    );
  }

  getPaciente(id: number): Observable<Paciente> {
    const url = `${this.baseUrl}/pacientes/${id}`;

    if (!this.sync.isOnline()) {
      return from(this.offlineDb.getPacienteById(id)).pipe(
        map(p => {
          if (!p) throw new Error('Paciente no encontrado offline');
          return p;
        })
      );
    }

    return this.http.get<Paciente>(url).pipe(
      tap(paciente => this.offlineDb.savePacientes([paciente])),
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.offlineDb.getPacienteById(id)).pipe(
            map(p => {
              if (!p) throw error;
              return p;
            })
          );
        }
        return this.manejarError(error, 'obtener paciente');
      })
    );
  }

  pacienteExpediente(expediente: string): Observable<PacienteJoin> {
    const url = `${this.baseUrl}/pacientes/expediente/${expediente}`;

    if (!this.sync.isOnline()) {
      return from(this.offlineDb.getAllPacientes()).pipe(
        map(lista => {
          const p = lista.find(x => x.expediente === expediente);
          if (!p) throw new Error('Paciente no encontrado offline');
          return p as unknown as PacienteJoin;
        })
      );
    }

    return this.http.get<PacienteJoin>(url).pipe(
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          return from(this.offlineDb.getAllPacientes()).pipe(
            map(lista => {
              const p = lista.find(x => x.expediente === expediente);
              if (!p) throw error;
              return p as unknown as PacienteJoin;
            })
          );
        }
        return this.manejarError(error, 'obtener paciente por expediente');
      })
    );
  }

  crearPaciente(paciente: Paciente, generar_expediente: boolean = false): Observable<any> {
    this.isLoading.set(true);
    const url = generar_expediente
      ? `${this.baseUrl}/pacientes/?gen_expediente=true`
      : `${this.baseUrl}/pacientes`;
    return this.offMutation('POST', url, paciente).pipe(
      tap(() => this.refrescarPacientes()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updatePaciente(
    pacienteId: number,
    paciente: any,
    accion: string = 'mantener'
  ): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/pacientes/${pacienteId}?accion=${accion}`, paciente).pipe(
      tap(() => this.refrescarPacientes()),
      finalize(() => this.isLoading.set(false))
    );
  }

  deletePaciente(pacienteId: number): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/paciente/eliminar/${pacienteId}`).pipe(
      tap(() => this.refrescarPacientes()),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= RELACIONES =======

  hijoDe(paciente: Hijode, idMadre: number): Observable<any> {
    this.isLoading.set(true);
    const payload = {
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
      estado: paciente.estado,
      datos_extra: paciente.datos_extra || {}
    };
    return this.offMutation('POST', `${this.baseUrl}/pacientes/madre-hijo/${idMadre}?auto_expediente=true`, payload).pipe(
      tap(() => this.refrescarPacientes()),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= CORRELATIVOS RELACIONADOS CON PACIENTE =======

  corExpediente(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/expediente`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de expediente'))
    );
  }

  corEmergencia(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/emergencia`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de emergencia'))
    );
  }

  // ======= RENAP =======

  getRenapITD(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/renap-persona`, params);
    return this.cacheGet(key,
      this.http.get<{ resultado: any }>(`${this.baseUrl}/renap-persona`, { params }).pipe(
        tap(response => response.resultado),
        catchError(error => this.manejarError(error, 'obtener datos RENAP'))
      ),
      10 * 60 * 1000
    );
  }

  // ======= CITAS =======

  private citasSubject = new BehaviorSubject<CitaResponse[]>([]);
  citas$ = this.citasSubject.asObservable();

  getCitasPaciente(id: number): Observable<CitaResponse[]> {
    const url = `${this.baseUrl}/citas/?paciente_id=${id}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key,
      this.http.get<any>(url).pipe(
        map(response => response?.citas ?? response ?? []),
        tap(citas => this.citasSubject.next(citas)),
        catchError(error => this.manejarError(error, 'obtener citas'))
      )
    );
  }

}
