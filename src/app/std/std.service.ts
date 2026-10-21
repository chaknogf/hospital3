// std.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../service/base-api.service';

import {
  Procedimiento,
  ProcedimientoCreate,
  ProcedimientoUpdate,
  ProceMedico,
  ProceMedicoCreate,
  ProceMedicoUpdate,
  ProcedimientosListResponse,
  CategoriaEdadItem,
  ProcedimientoMasUsado
} from '../interface/procedimientos';

@Injectable({ providedIn: 'root' })
/** Centraliza el catálogo de procedimientos y los procedimientos realizados. */
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
    const url = `${this.baseUrl}/catalogo-procedimientos/`;
    const params = this.limpiarParametros({ skip: 0, limit: 500, activo: true });
    const key = this.cacheKey(url, params);
    return this.cacheGet(key,
      this.http.get<{ total: number; items: Procedimiento[] }>(url, { params }).pipe(
        tap(page => this.catalogoSubject.next(page.items)),
        map(page => page.items),
        catchError(error => this.manejarError(error, 'obtener catálogo'))
      ),
      30 * 60 * 1000
    );
  }

  getProcedimientoCatalogo(id: number): Observable<Procedimiento> {
    return this.http.get<Procedimiento>(
      `${this.baseUrl}/catalogo-procedimientos/${id}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener procedimiento'))
    );
  }

  createProcedimiento(
    datos: ProcedimientoCreate
  ): Observable<Procedimiento> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/catalogo-procedimientos/`, datos).pipe(
      tap(() => this.getCatalogo().subscribe()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateProcedimiento(
    id: number,
    datos: ProcedimientoUpdate
  ): Observable<Procedimiento> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/catalogo-procedimientos/${id}`, datos).pipe(
      tap(() => this.getCatalogo().subscribe()),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteProcedimiento(id: number): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/catalogo-procedimientos/${id}`).pipe(
      tap(() => this.getCatalogo().subscribe()),
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
    const key = this.cacheKey(`${this.baseUrl}/procedimientos`, params);

    return this.cacheGet(key,
      this.http.get<ProcedimientosListResponse>(
        `${this.baseUrl}/procedimientos`,
        { params }
      ).pipe(
        tap(response =>
          this.procedimientosSubject.next(response.procedimientos)
        ),
        catchError(error =>
          this.manejarError(error, 'obtener procedimientos')
        )
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

  /** Categorías de edad (niño/adulto) admitidas en los registros de procedimiento. */
  getGruposEdad(): Observable<CategoriaEdadItem[]> {
    return this.http.get<CategoriaEdadItem[]>(
      `${this.baseUrl}/procedimientos/grupos-edad`
    ).pipe(
      catchError(error =>
        this.manejarError(error, 'obtener grupos de edad')
      )
    );
  }

  /** Procedimientos más usados por especialidad, para la hoja de captura manual. */
  getMasUsados(params: {
    especialidad_id?: number;
    desde?: string;
    hasta?: string;
    limite?: number;
  }): Observable<{ procedimientos: ProcedimientoMasUsado[]; total: number }> {
    return this.http
      .get<{ procedimientos: ProcedimientoMasUsado[]; total: number }>(
        `${this.baseUrl}/procedimientos/mas-usados`,
        { params }
      )
      .pipe(
        catchError(error =>
          this.manejarError(error, 'obtener procedimientos más usados')
        )
      );
  }

  createProcedimientoMedico(
    datos: ProceMedicoCreate
  ): Observable<ProceMedico> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/procedimientos`, datos).pipe(
      tap(() => this.refrescarProcedimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateProcedimientoMedico(
    id: number,
    datos: ProceMedicoUpdate
  ): Observable<ProceMedico> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/procedimientos/${id}`, datos).pipe(
      tap(() => this.refrescarProcedimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteProcedimientoMedico(
    id: number
  ): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/procedimientos/${id}`).pipe(
      tap(() => this.refrescarProcedimientos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  // =====================================================
  // CHAT INTELIGENTE (NL→SQL)
  // =====================================================

  consultarChat(mensajes: { role: string; content: string }[]): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/chat/consulta`,
      { mensajes }
    ).pipe(
      catchError(error => this.manejarError(error, 'consultar agente'))
    );
  }

  obtenerTablasChat(): Observable<any> {
    const key = this.cacheKey(`${this.baseUrl}/chat/tablas`);
    return this.cacheGet(key,
      this.http.get(`${this.baseUrl}/chat/tablas`).pipe(
        catchError(error => this.manejarError(error, 'obtener tablas'))
      ),
      60 * 60 * 1000
    );
  }


}
