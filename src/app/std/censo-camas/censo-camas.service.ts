import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService } from '../../service/base-api.service';
import {
  CensoCamasCreate,
  CensoCamasUpdate,
  CensoCamasOut,
  CensoCamasListResponse,
  CensoDiarioResumen,
  CensoCamasFiltros,
  CensoEstadisticaResponse,
} from './censo-camas.interface';

@Injectable({ providedIn: 'root' })
export class CensoCamasService extends BaseApiService {

  private registrosSubject = new BehaviorSubject<CensoCamasOut[]>([]);
  registros$ = this.registrosSubject.asObservable();

  private resumenSubject = new BehaviorSubject<CensoDiarioResumen | null>(null);
  resumen$ = this.resumenSubject.asObservable();

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  getRegistros(filtros: CensoCamasFiltros): Observable<CensoCamasListResponse> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/censo-camas`, params);
    return this.cacheGet(key,
      this.http.get<CensoCamasListResponse>(`${this.baseUrl}/censo-camas`, { params }).pipe(
        tap(res => this.registrosSubject.next(res.registros)),
        catchError(error => this.manejarError(error, 'obtener registros de censo'))
      )
    );
  }

  getRegistro(id: number): Observable<CensoCamasOut> {
    return this.http.get<CensoCamasOut>(`${this.baseUrl}/censo-camas/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener registro de censo'))
    );
  }

  getResumen(fecha: string): Observable<CensoDiarioResumen> {
    return this.http.get<CensoDiarioResumen>(`${this.baseUrl}/censo-camas/resumen/${fecha}`).pipe(
      tap(res => this.resumenSubject.next(res)),
      catchError(error => this.manejarError(error, 'obtener resumen diario'))
    );
  }

  crear(data: CensoCamasCreate): Observable<CensoCamasOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/censo-camas/`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  upsert(data: CensoCamasCreate): Observable<CensoCamasOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/censo-camas/upsert`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizar(id: number, data: CensoCamasUpdate): Observable<CensoCamasOut> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/censo-camas/${id}`, data).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminar(id: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/censo-camas/${id}`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  bulk(registros: CensoCamasCreate[]): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/censo-camas/bulk`, registros).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  importarCSV(archivo: File): Observable<any> {
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<any>(`${this.baseUrl}/censo-camas/importar-csv`, formData).pipe(
      catchError(error => this.manejarError(error, 'importar CSV de censo')),
      finalize(() => this.isLoading.set(false))
    );
  }

  getEstadisticas(desde: string, hasta: string): Observable<CensoEstadisticaResponse> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    const key = this.cacheKey(`${this.baseUrl}/censo-camas/estadisticas`, params);
    return this.cacheGet(key,
      this.http.get<CensoEstadisticaResponse>(`${this.baseUrl}/censo-camas/estadisticas`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener estadísticas de censo'))
      )
    );
  }
}
