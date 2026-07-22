import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService } from '../../service/base-api.service';
import { NacimientoOut, NacimientoCreate, NacimientoUpdate, NeonatalesPayload, NacimientoListResponse } from '../../interface/nacimientos';

@Injectable({ providedIn: 'root' })
export class NacimientosService extends BaseApiService {
  private nacimientosSubject = new BehaviorSubject<NacimientoOut[]>([]);
  nacimientos$ = this.nacimientosSubject.asObservable();

  private ultimoFiltro: any = { skip: 0, limit: 20 };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private refrescarNacimientos(): void {
    this.getNacimientos(this.ultimoFiltro).subscribe();
  }

  getNacimientos(filtros: any): Observable<NacimientoListResponse> {
    this.ultimoFiltro = filtros;
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/nacimientos/`, params);
    return this.cacheGet(key,
      this.http.get<NacimientoListResponse>(`${this.baseUrl}/nacimientos/`, { params }).pipe(
        tap(response => this.nacimientosSubject.next(response.nacimientos)),
        catchError(error => this.manejarError(error, 'obtener nacimientos'))
      ),
      2 * 60 * 1000
    );
  }

  getNacimiento(id: number): Observable<NacimientoOut> {
    return this.http.get<NacimientoOut>(`${this.baseUrl}/nacimientos/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener nacimiento'))
    );
  }

  createNacimiento(datos: NacimientoCreate): Observable<NacimientoOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/nacimientos/`, datos).pipe(
      tap(() => this.refrescarNacimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateNacimiento(id: number, datos: NacimientoUpdate): Observable<NacimientoOut> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/nacimientos/${id}`, datos).pipe(
      tap(() => this.refrescarNacimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updatePacienteNeonatales(pacienteId: number, neonatales: NeonatalesPayload): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/pacientes/${pacienteId}`, {
      datos_extra: { neonatales }
    }).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  createDesdePaciente(pacienteId: number): Observable<NacimientoOut> {
    this.isLoading.set(true);
    return this.http.post<NacimientoOut>(
      `${this.baseUrl}/nacimientos/desde-paciente/${pacienteId}`, {}
    ).pipe(
      tap(() => this.refrescarNacimientos()),
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'crear nacimiento desde paciente'))
    );
  }

  updateNeonatales(id: number, neonatales: NeonatalesPayload): Observable<NacimientoOut> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/nacimientos/${id}/neonatales`, { neonatales }).pipe(
      tap(() => this.refrescarNacimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  sincronizar(): Observable<{ sincronizados: number; creados: number; errores: number }> {
    this.isLoading.set(true);
    return this.http.post<{ sincronizados: number; creados: number; errores: number }>(
      `${this.baseUrl}/nacimientos/sincronizar`, {}
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'sincronizar nacimientos'))
    );
  }

  referenciarLegacy(): Observable<any> {
    return this.http.get(`${this.baseUrl}/nacimientos/referenciar-legacy`).pipe(
      catchError(error => this.manejarError(error, 'referenciar legacy'))
    );
  }

  recomputar(): Observable<{ procesados: number; actualizados: number }> {
    this.isLoading.set(true);
    return this.http.post<{ procesados: number; actualizados: number }>(
      `${this.baseUrl}/nacimientos/recomputar`, {}
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'recomputar nacimientos'))
    );
  }

  deleteNacimiento(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/nacimientos/${id}`).pipe(
      tap(() => this.refrescarNacimientos()),
      catchError(error => this.manejarError(error, 'eliminar nacimiento'))
    );
  }

  getAllNacimientos(filtros: any): Observable<NacimientoOut[]> {
    const params = this.limpiarParametros({ ...filtros, skip: 0, limit: 500 });
    return this.http.get<NacimientoListResponse>(`${this.baseUrl}/nacimientos/`, { params }).pipe(
      map(r => r.nacimientos),
      catchError(error => this.manejarError(error, 'obtener todos los nacimientos'))
    );
  }
}
