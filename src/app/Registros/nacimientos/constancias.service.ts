import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { BehaviorSubject, Cons, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { ConstanciaNacimientoOut, ConstanciaNacimientoCreate, ConstanciaNacHistorial, ConstanciaNacimientoUpdate } from '../../interface/consNac';
import { ConstanciaNacimiento } from './constancias.inteface';

@Injectable({ providedIn: 'root' })
export class ConstanciasService extends BaseApiService {
  // ======= BEHAVIOR SUBJECTS =======
  private constanciasSubject = new BehaviorSubject<any[]>([]);
  constancias$ = this.constanciasSubject.asObservable();


  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ======= PRIVADOS =======
  private ultimimoFiltroConstancia: PaginationState = {
    filtro: { skip: 0, limit: 8 }
  };

  private refrescarConstancias(): void {
    this.getConstancias(this.ultimimoFiltroConstancia.filtro).subscribe();
  }

  getConstancias(filtros: any): Observable<ConstanciaNacimiento[]> {
    this.ultimimoFiltroConstancia.filtro = filtros;
    const params = this.limpiarParametros(filtros);
    return this.http.get<ConstanciaNacimiento[]>(
      `${this.baseUrl}/constancias-nacimiento/`,
      { params }
    ).pipe(
      tap(response => this.constanciasSubject.next(response)),
      catchError(error => this.manejarError(error, 'obtener constancias'))
    )
  }

  getCostancia(id: number): Observable<ConstanciaNacimiento> {
    return this.http.get<ConstanciaNacimiento>(
      `${this.baseUrl}/constancias-nacimiento/${id}`
    ).pipe(
      map(response => response),
      catchError(error => this.manejarError(error, 'obtener constancia'))
    )
  }

  updateConstancia(id: number, data: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.put<any>(
      `${this.baseUrl}/constancias-nacimiento/${id}`,
      data
    ).pipe(
      tap(() => this.refrescarConstancias()),
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'actualizar constancia'))
    );
  }

  deleteConstancia(id: number): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(
      `${this.baseUrl}/constancias-nacimiento/${id}`
    ).pipe(
      tap(() => this.refrescarConstancias()),
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'eliminar constancia'))
    );
  }




  // ========== nacimientos legacy ==========

  getConstanciasLegacy(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(
      `${this.baseUrl}/nacimientos-legacy/`,
      { params }
    ).pipe(
      map(response => response.data),
      catchError(error => this.manejarError(error, 'obtener constancias'))
    )
  }

  updateConstanciaLegacy(id: number, data: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.put<any>(
      `${this.baseUrl}/nacimientos-legacy/${id}`,
      data
    ).pipe(
      tap(() => this.refrescarConstancias()),
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'actualizar constancia'))
    );
  }





}
