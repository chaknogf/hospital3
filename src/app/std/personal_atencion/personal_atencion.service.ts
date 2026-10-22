// medicos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroPersonalAtencion, PersonalAtencionCreate, PersonalAtencionListResponse, PersonalAtencionOut, PersonalAtencionUpdate } from '../../interface/personal_atencion.interface';

/** Opción de especialidad utilizada en formularios de personal médico. */
export interface EspecialidadItem {
  id: number;
  nombre: string;
  abreviatura?: string;
  codigo?: string;
}



@Injectable({
  providedIn: 'root'
})
/** Consulta y mantiene el personal médico y sus especialidades. */
export class PersonalAtencionService extends BaseApiService {

  // ======= SUBJECTS =======

  private personalAtencionSubject = new BehaviorSubject<PersonalAtencionOut[]>([]);
  personalAtencion$ = this.personalAtencionSubject.asObservable();

  // ======= PAGINACIÓN / FILTROS =======

  private ultimoFiltro: PaginationState = {
    filtro: {
      limit: 100
    }
  };

  constructor(
    http: HttpClient,
    router: Router
  ) {
    super(http, router);
  }

  // ======= PRIVADOS =======

  private refrescarPersonalAtencion(): void {
    this.getPersonalAtencion(this.ultimoFiltro.filtro).subscribe();
  }

  getEspecialidades(): Observable<EspecialidadItem[]> {
    return this.http.get<EspecialidadItem[]>(
      `${this.baseUrl}/especialidades/`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener especialidades'))
    );
  }

  // ======= GET =======

  /**
   * Lista médicos (paginado)
   * GET /personal-atencion
   */
  getPersonalAtencion(filtros?: FiltroPersonalAtencion): Observable<PersonalAtencionListResponse> {
    this.ultimoFiltro.filtro = filtros ?? {};

    const params = this.limpiarParametros(filtros ?? {});

    return this.http.get<PersonalAtencionListResponse>(
      `${this.baseUrl}/personal-atencion`,
      { params }
    ).pipe(
      tap(response => this.personalAtencionSubject.next(response.personal_atencion)),
      catchError(error => this.manejarError(error, 'obtener personal de atención'))
    );
  }

  /**
   * Obtiene todos los médicos (sin límite) para exportación
   */
  getAllPersonalAtencion(): Observable<PersonalAtencionOut[]> {
    const params = this.limpiarParametros({ skip: 0, limit: 500 });
    return this.http.get<PersonalAtencionListResponse>(
      `${this.baseUrl}/personal-atencion`,
      { params }
    ).pipe(
      map(response => response.personal_atencion),
      catchError(error => this.manejarError(error, 'obtener todos los médicos'))
    );
  }

  /**
   * Obtiene un médico por ID
   * GET /personal-atencion/{id}
   */
  getPersonalAtencionById(id: number): Observable<PersonalAtencionOut> {
    return this.http.get<PersonalAtencionOut>(
      `${this.baseUrl}/personal-atencion/${id}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener médico'))
    );
  }

  /**
   * Busca primer médico que coincida
   */
  buscarPersonalAtencion(filtros: FiltroPersonalAtencion): Observable<PersonalAtencionOut | null> {
    // El formulario usa una coincidencia para precargar el primer resultado encontrado.
    const params = this.limpiarParametros(filtros);

    return this.http.get<PersonalAtencionListResponse>(
      `${this.baseUrl}/personal-atencion`,
      { params }
    ).pipe(
      map(response => response.personal_atencion?.length > 0 ? response.personal_atencion[0] : null),
      catchError(error => this.manejarError(error, 'buscar médico'))
    );
  }

  // ======= POST =======

  /**
   * Crear médico
   * POST /personal-atencion
   */
  crearPersonalAtencion(data: PersonalAtencionCreate): Observable<PersonalAtencionOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/personal-atencion`, data).pipe(
      tap(() => this.refrescarPersonalAtencion()),
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizarPersonalAtencion(
    medicoId: number,
    data: PersonalAtencionUpdate
  ): Observable<PersonalAtencionOut> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/personal-atencion/${medicoId}`, data).pipe(
      tap(() => this.refrescarPersonalAtencion()),
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarPersonalAtencion(medicoId: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/personal-atencion/${medicoId}`).pipe(
      tap(() => this.refrescarPersonalAtencion()),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= HELPERS =======

  /**
   * Cambia estado activo/inactivo
   */
  cambiarEstado(
    medicoId: number,
    activo: boolean
  ): Observable<PersonalAtencionOut> {
    return this.actualizarPersonalAtencion(medicoId, { activo });
  }
}
