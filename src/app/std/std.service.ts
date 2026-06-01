// std.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../service/base-api.service';

import {
  Procedimiento,
  ProcedimientoCreate,
  ProcedimientoUpdate,
  ProceMedico,
  ProceMedicoCreate,
  ProceMedicoUpdate,
  ProcedimientosListResponse
} from '../interface/procedimientos';

@Injectable({ providedIn: 'root' })
export class StdService extends BaseApiService {

  private procedimientosSubject = new BehaviorSubject<ProceMedico[]>([]);
  procedimientos$ = this.procedimientosSubject.asObservable();

  private catalogoSubject = new BehaviorSubject<Procedimiento[]>([]);
  catalogo$ = this.catalogoSubject.asObservable();

  private ultimoFiltro: PaginationState = {
    filtro: {
      skip: 0,
      limit: 50
    }
  };

  constructor(
    http: HttpClient,
    router: Router
  ) {
    super(http, router);
  }

  private refrescarProcedimientos(): void {
    this.getProcedimientos(this.ultimoFiltro.filtro).subscribe();
  }

  // =====================================================
  // CATÁLOGO DE PROCEDIMIENTOS
  // =====================================================

  getCatalogo(): Observable<Procedimiento[]> {
    return this.http.get<Procedimiento[]>(
      `${this.baseUrl}/procedimientos/catalogo`
    ).pipe(
      tap(data => this.catalogoSubject.next(data)),
      catchError(error => this.manejarError(error, 'obtener catálogo'))
    );
  }

  getProcedimientoCatalogo(id: number): Observable<Procedimiento> {
    return this.http.get<Procedimiento>(
      `${this.baseUrl}/procedimientos/catalogo/${id}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener procedimiento'))
    );
  }

  createProcedimiento(
    datos: ProcedimientoCreate
  ): Observable<Procedimiento> {
    this.isLoading.set(true);

    return this.http.post<Procedimiento>(
      `${this.baseUrl}/procedimientos/catalogo`,
      datos
    ).pipe(
      tap(() => this.getCatalogo().subscribe()),
      catchError(error => this.manejarError(error, 'crear procedimiento')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateProcedimiento(
    id: number,
    datos: ProcedimientoUpdate
  ): Observable<Procedimiento> {
    this.isLoading.set(true);

    return this.http.put<Procedimiento>(
      `${this.baseUrl}/procedimientos/catalogo/${id}`,
      datos
    ).pipe(
      tap(() => this.getCatalogo().subscribe()),
      catchError(error => this.manejarError(error, 'actualizar procedimiento')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteProcedimiento(id: number): Observable<any> {
    this.isLoading.set(true);

    return this.http.delete(
      `${this.baseUrl}/procedimientos/catalogo/${id}`
    ).pipe(
      tap(() => this.getCatalogo().subscribe()),
      catchError(error => this.manejarError(error, 'eliminar procedimiento')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // =====================================================
  // PROCEDIMIENTOS MÉDICOS
  // =====================================================

  getProcedimientos(
    filtros: any
  ): Observable<ProcedimientosListResponse> {

    this.ultimoFiltro.filtro = filtros;

    const params = this.limpiarParametros(filtros);

    return this.http.get<ProcedimientosListResponse>(
      `${this.baseUrl}/procedimientos`,
      { params }
    ).pipe(
      tap(response =>
        this.procedimientosSubject.next(response.procedimientos)
      ),
      catchError(error =>
        this.manejarError(error, 'obtener procedimientos')
      )
    );
  }

  getProcedimientoMedico(
    id: number,
    includeProcedimiento = true
  ): Observable<ProceMedico> {

    return this.http.get<ProceMedico>(
      `${this.baseUrl}/procedimientos/${id}`,
      {
        params: {
          include_procedimiento: includeProcedimiento
        }
      }
    ).pipe(
      catchError(error =>
        this.manejarError(error, 'obtener procedimiento médico')
      )
    );
  }

  createProcedimientoMedico(
    datos: ProceMedicoCreate
  ): Observable<ProceMedico> {

    this.isLoading.set(true);

    return this.http.post<ProceMedico>(
      `${this.baseUrl}/procedimientos`,
      datos
    ).pipe(
      tap(() => this.refrescarProcedimientos()),
      catchError(error =>
        this.manejarError(error, 'crear procedimiento médico')
      ),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateProcedimientoMedico(
    id: number,
    datos: ProceMedicoUpdate
  ): Observable<ProceMedico> {

    this.isLoading.set(true);

    return this.http.put<ProceMedico>(
      `${this.baseUrl}/procedimientos/${id}`,
      datos
    ).pipe(
      tap(() => this.refrescarProcedimientos()),
      catchError(error =>
        this.manejarError(error, 'actualizar procedimiento médico')
      ),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteProcedimientoMedico(
    id: number
  ): Observable<any> {

    this.isLoading.set(true);

    return this.http.delete(
      `${this.baseUrl}/procedimientos/${id}`
    ).pipe(
      tap(() => this.refrescarProcedimientos()),
      catchError(error =>
        this.manejarError(error, 'eliminar procedimiento médico')
      ),
      finalize(() => this.isLoading.set(false))
    );
  }


}
