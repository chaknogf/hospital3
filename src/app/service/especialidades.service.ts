import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Especialidad } from '../interface/quirofano.interface';

/** Acceso al catálogo de especialidades, con caché de lecturas y mutaciones offline. */
@Injectable({ providedIn: 'root' })
export class EspecialidadesService extends BaseApiService {

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  /** Lista especialidades filtrando por vigencia o disponibilidad en quirófano. */
  getEspecialidades(estado?: boolean, sop?: boolean): Observable<Especialidad[]> {
    this.isLoading.set(true);
    const params: any = {};
    if (estado !== undefined) params.estado = estado;
    if (sop !== undefined) params.sop = sop;
    const qs = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/especialidades/${qs ? '?' + qs : ''}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<Especialidad[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener especialidades'))
    ));
  }

  /** Crea una especialidad; si no hay red, la operación queda en cola local. */
  crearEspecialidad(data: Partial<Especialidad>): Observable<Especialidad> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/especialidades/`;
    return this.offMutation('POST', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<Especialidad>;
  }

  actualizarEspecialidad(id: number, data: Partial<Especialidad>): Observable<Especialidad> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/especialidades/${id}`;
    return this.offMutation('PUT', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<Especialidad>;
  }

  eliminarEspecialidad(id: number): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/especialidades/${id}`;
    return this.offMutation('DELETE', url).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
