import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Especialidad } from '../interface/quirofano.interface';

@Injectable({ providedIn: 'root' })
export class EspecialidadesService extends BaseApiService {

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

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
