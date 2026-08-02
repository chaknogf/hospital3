// sigsa3-registros.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BaseApiService } from '../../service/base-api.service';
import {
  Sigsa3Registro,
  Sigsa3RegistroCreate,
  Sigsa3RegistroUpdate,
  FiltroSigsa3Registro,
  Sigsa3RegistroListResponse,
} from '../../interface/sigsa3-registros.interface';

@Injectable({ providedIn: 'root' })
export class Sigsa3RegistrosService extends BaseApiService {

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ── GET ──

  listarRegistros(filtros?: FiltroSigsa3Registro): Observable<Sigsa3RegistroListResponse> {
    const params = this.limpiarParametros(filtros ?? {});
    const key = this.cacheKey(`${this.baseUrl}/sigsa3-registros`, params);

    return this.cacheGet(
      key,
      this.http.get<Sigsa3RegistroListResponse>(`${this.baseUrl}/sigsa3-registros`, { params }).pipe(
        catchError(error => this.manejarError(error, 'listar registros SIGSA-3 normalizados'))
      )
    );
  }

  obtenerRegistro(id: number): Observable<Sigsa3Registro> {
    return this.http.get<Sigsa3Registro>(`${this.baseUrl}/sigsa3-registros/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener registro SIGSA-3 normalizado'))
    );
  }

  // ── POST / PATCH / DELETE ──

  crearRegistro(data: Sigsa3RegistroCreate): Observable<Sigsa3Registro> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/sigsa3-registros`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizarRegistro(id: number, data: Sigsa3RegistroUpdate): Observable<Sigsa3Registro> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/sigsa3-registros/${id}`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarRegistro(id: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/sigsa3-registros/${id}`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
