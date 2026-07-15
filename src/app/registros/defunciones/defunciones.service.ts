import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BaseApiService } from '../../service/base-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import {
  DefuncionOut, DefuncionCreate, DefuncionUpdate, DefuncionListResponse,
  PacientesFallecidosResponse, RegistrarDefuncionRequest
} from '../../interface/consDef';
import { Defuncion } from './defunciones.interface';

@Injectable({ providedIn: 'root' })
export class DefuncionesService extends BaseApiService {
  private defuncionesSubject = new BehaviorSubject<Defuncion[]>([]);
  defunciones$ = this.defuncionesSubject.asObservable();

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private ultimoFiltro: any = { skip: 0, limit: 10 };

  private refrescar(): void {
    this.listarDefunciones(this.ultimoFiltro).subscribe();
  }

  listarDefunciones(filtros: any): Observable<DefuncionListResponse> {
    this.ultimoFiltro = filtros;
    const params = this.limpiarParametros(filtros);
    return this.http.get<DefuncionListResponse>(
      `${this.baseUrl}/defunciones/`,
      { params }
    ).pipe(
      tap(r => this.defuncionesSubject.next(r.defunciones)),
      catchError(e => this.manejarError(e, 'listar defunciones'))
    );
  }

  getDefuncion(id: number): Observable<DefuncionOut> {
    return this.http.get<DefuncionOut>(
      `${this.baseUrl}/defunciones/${id}`
    ).pipe(
      catchError(e => this.manejarError(e, 'obtener defunción'))
    );
  }

  createDefuncion(data: DefuncionCreate): Observable<DefuncionOut> {
    this.isLoading.set(true);
    return this.http.post<DefuncionOut>(
      `${this.baseUrl}/defunciones/`,
      data
    ).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false)),
      catchError(e => this.manejarError(e, 'crear defunción'))
    );
  }

  registrarDefuncion(pacienteId: number, data: RegistrarDefuncionRequest): Observable<DefuncionOut> {
    this.isLoading.set(true);
    return this.http.post<DefuncionOut>(
      `${this.baseUrl}/defunciones/registrar/${pacienteId}`,
      data
    ).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false)),
      catchError(e => this.manejarError(e, 'registrar defunción'))
    );
  }

  updateDefuncion(id: number, data: DefuncionUpdate): Observable<DefuncionOut> {
    this.isLoading.set(true);
    return this.http.patch<DefuncionOut>(
      `${this.baseUrl}/defunciones/${id}`,
      data
    ).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false)),
      catchError(e => this.manejarError(e, 'actualizar defunción'))
    );
  }

  deleteDefuncion(id: number): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(
      `${this.baseUrl}/defunciones/${id}`
    ).pipe(
      tap(() => this.refrescar()),
      finalize(() => this.isLoading.set(false)),
      catchError(e => this.manejarError(e, 'eliminar defunción'))
    );
  }

  buscarPacientesFallecidos(filtros: any): Observable<PacientesFallecidosResponse> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<PacientesFallecidosResponse>(
      `${this.baseUrl}/defunciones/pacientes`,
      { params }
    ).pipe(
      catchError(e => this.manejarError(e, 'buscar pacientes fallecidos'))
    );
  }
}
