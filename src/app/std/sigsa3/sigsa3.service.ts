// sigsa3.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import {
  Sigsa3Out,
  Sigsa3Create,
  Sigsa3Update,
  FiltroSigsa3,
  Sigsa3EspecialidadResponse,
  Sigsa3DxFrecuentesResponse,
  Sigsa3DxZResponse,
  ProgresoSigsa3,
  PersonalSalud,
  PersonalSaludCreate,
  PersonalSaludUpdate
} from '../../interface/sigsa3.interface';

@Injectable({ providedIn: 'root' })
export class Sigsa3Service extends BaseApiService {

  private registrosSubject = new BehaviorSubject<Sigsa3Out[]>([]);
  registros$ = this.registrosSubject.asObservable();

  private ultimoFiltro: PaginationState = { filtro: { limit: 100 } };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private refrescar(): void {
    this.listarRegistros(this.ultimoFiltro.filtro).subscribe();
  }

  // ── GET ──

  listarRegistros(filtros?: FiltroSigsa3): Observable<Sigsa3Out[]> {
    this.ultimoFiltro.filtro = filtros ?? {};
    const params = this.limpiarParametros(filtros ?? {});
    const key = this.cacheKey(`${this.baseUrl}/sigsa3`, params);

    return this.cacheGet(key,
      this.http.get<Sigsa3Out[]>(`${this.baseUrl}/sigsa3`, { params }).pipe(
        tap(data => this.registrosSubject.next(data)),
        catchError(error => this.manejarError(error, 'listar registros SIGSA3'))
      )
    );
  }

  obtenerRegistro(id: number): Observable<Sigsa3Out> {
    return this.http.get<Sigsa3Out>(`${this.baseUrl}/sigsa3/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener registro SIGSA3'))
    );
  }

  listarNoAsociados(limit = 100): Observable<Sigsa3Out[]> {
    const params = new (this as any).http.constructor !== undefined
      ? this.limpiarParametros({ limit })
      : this.limpiarParametros({ limit });
    return this.http.get<Sigsa3Out[]>(`${this.baseUrl}/sigsa3/no-asociados/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'listar no asociados'))
    );
  }

  // ── POST ──

  crearRegistro(data: Sigsa3Create): Observable<Sigsa3Out> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3`, data).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false))
    );
  }

  importarExcel(file: File): Observable<{ insertados: number; errores: number }> {
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ insertados: number; errores: number }>(
      `${this.baseUrl}/sigsa3/importar-excel`, formData
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'importar Excel SIGSA3'))
    );
  }

  asociarPaciente(expediente: string, noHistoriaClinica: string): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3/asociar-paciente`, {
      expediente, no_historia_clinica: noHistoriaClinica
    }).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarPorIds(ids: number[]): Observable<{ eliminados: number }> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3/eliminar-por-ids`, { ids }).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarPorPeriodo(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3/eliminar-por-periodo`, { desde, hasta }).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false))
    );
  }

  asociarPacientesMasivo(): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3/asociar-pacientes-masivo`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  asociarPacientesMasivoStream(): Observable<ProgresoSigsa3> {
    return new Observable<ProgresoSigsa3>(subscriber => {
      const token = localStorage.getItem('access_token');
      const url = `${this.baseUrl}/sigsa3/asociar-pacientes-masivo-stream`;
      const controller = new AbortController();

      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: controller.signal,
      }).then(response => {
        if (!response.ok) {
          subscriber.error(new Error(`HTTP ${response.status}`));
          return;
        }
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function pump(): void {
          reader.read().then(({ done, value }) => {
            if (done) {
              subscriber.complete();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n');
            buffer = parts.pop() || '';
            for (const line of parts) {
              if (line.startsWith('data: ')) {
                try {
                  const data: ProgresoSigsa3 = JSON.parse(line.slice(6));
                  subscriber.next(data);
                  if (data.step === 'done' || data.step === 'error') {
                    reader.cancel();
                    subscriber.complete();
                    return;
                  }
                } catch (e) {
                  console.warn('SSE parse error:', e);
                }
              }
            }
            pump();
          }).catch(err => subscriber.error(err));
        }
        pump();
      }).catch(err => subscriber.error(err));

      return () => controller.abort();
    });
  }

  truncate(): Observable<{ truncado: boolean; tabla: string }> {
    this.isLoading.set(true);
    return this.http.post<{ truncado: boolean; tabla: string }>(
      `${this.baseUrl}/sigsa3/truncate`, {}
    ).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'truncar SIGSA3'))
    );
  }

  exportarCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/sigsa3/exportar-csv`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => this.manejarError(error, 'exportar CSV SIGSA3'))
    );
  }

  sincronizarMedicoEspecialidad(): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/sigsa3/sincronizar-medico-especialidad`, {}).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'sincronizar médico especialidad'))
    );
  }

  // ── PUT / DELETE ──

  actualizarRegistro(id: number, data: Sigsa3Update): Observable<Sigsa3Out> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/sigsa3/${id}`, data).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarRegistro(id: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/sigsa3/${id}`).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── Personal Salud ──

  listarPersonalSalud(): Observable<PersonalSalud[]> {
    return this.http.get<PersonalSalud[]>(`${this.baseUrl}/sigsa3/personal-salud`).pipe(
      catchError(error => this.manejarError(error, 'listar personal salud'))
    );
  }

  obtenerPersonalSalud(id: number): Observable<PersonalSalud> {
    return this.http.get<PersonalSalud>(`${this.baseUrl}/sigsa3/personal-salud/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener personal salud'))
    );
  }

  crearPersonalSalud(data: PersonalSaludCreate): Observable<PersonalSalud> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3/personal-salud`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizarPersonalSalud(id: number, data: PersonalSaludUpdate): Observable<PersonalSalud> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/sigsa3/personal-salud/${id}`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarPersonalSalud(id: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/sigsa3/personal-salud/${id}`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── Estadísticas ──

  sigsa3PorEspecialidad(desde: string, hasta: string): Observable<Sigsa3EspecialidadResponse> {
    this.isLoading.set(true);
    const params = this.limpiarParametros({ desde, hasta });
    return this.http.get<Sigsa3EspecialidadResponse>(
      `${this.baseUrl}/estadisticas/sigsa3/por-especialidad`, { params }
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estadísticas SIGSA3 por especialidad'))
    );
  }

  sigsa3DxZ34(desde: string, hasta: string): Observable<Sigsa3DxZResponse> {
    this.isLoading.set(true);
    const params = this.limpiarParametros({ desde, hasta });
    return this.http.get<Sigsa3DxZResponse>(
      `${this.baseUrl}/sigsa3/dx/z34`, { params }
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener diagnósticos Z:34'))
    );
  }

  sigsa3DxZ10(desde: string, hasta: string): Observable<Sigsa3DxZResponse> {
    this.isLoading.set(true);
    const params = this.limpiarParametros({ desde, hasta });
    return this.http.get<Sigsa3DxZResponse>(
      `${this.baseUrl}/sigsa3/dx/z10`, { params }
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener diagnósticos Z:10'))
    );
  }

  sigsa3DxFrecuentes(
    desde: string,
    hasta: string,
    top = 10,
    tipo_consulta?: number,
    especialidad?: string
  ): Observable<Sigsa3DxFrecuentesResponse> {
    this.isLoading.set(true);
    const params = this.limpiarParametros({ desde, hasta, top, tipo_consulta, especialidad });
    return this.http.get<Sigsa3DxFrecuentesResponse>(
      `${this.baseUrl}/estadisticas/sigsa3/dx-frecuentes`, { params }
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener dx frecuentes SIGSA3'))
    );
  }
}
