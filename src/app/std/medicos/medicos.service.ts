// medicos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroMedico, MedicoCreate, MedicoListResponse, MedicoOut, MedicoUpdate } from '../../interface/medicos.interface';

export interface EspecialidadItem {
  id: number;
  nombre: string;
  abreviatura?: string;
  codigo?: string;
}



@Injectable({
  providedIn: 'root'
})
export class MedicosService extends BaseApiService {

  // ======= SUBJECTS =======

  private medicosSubject = new BehaviorSubject<MedicoOut[]>([]);
  medicos$ = this.medicosSubject.asObservable();

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

  private refrescarMedicos(): void {
    this.getMedicos(this.ultimoFiltro.filtro).subscribe();
  }

  getEspecialidades(): Observable<EspecialidadItem[]> {
    return this.http.get<EspecialidadItem[]>(
      `${this.baseUrl}/especialidades`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener especialidades'))
    );
  }

  // ======= GET =======

  /**
   * Lista médicos (paginado)
   * GET /personal-atencion
   */
  getMedicos(filtros?: FiltroMedico): Observable<MedicoListResponse> {
    this.ultimoFiltro.filtro = filtros ?? {};

    const params = this.limpiarParametros(filtros ?? {});

    return this.http.get<MedicoListResponse>(
      `${this.baseUrl}/personal-atencion`,
      { params }
    ).pipe(
      tap(response => this.medicosSubject.next(response.personal_atencion)),
      catchError(error => this.manejarError(error, 'obtener médicos'))
    );
  }

  /**
   * Obtiene todos los médicos (sin límite) para exportación
   */
  getAllMedicos(): Observable<MedicoOut[]> {
    const params = this.limpiarParametros({ skip: 0, limit: 500 });
    return this.http.get<MedicoListResponse>(
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
  getMedico(id: number): Observable<MedicoOut> {
    return this.http.get<MedicoOut>(
      `${this.baseUrl}/personal-atencion/${id}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener médico'))
    );
  }

  /**
   * Busca primer médico que coincida
   */
  buscarMedico(filtros: FiltroMedico): Observable<MedicoOut | null> {
    const params = this.limpiarParametros(filtros);

    return this.http.get<MedicoListResponse>(
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
  crearMedico(data: MedicoCreate): Observable<MedicoOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/personal-atencion`, data).pipe(
      tap(() => this.refrescarMedicos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizarMedico(
    medicoId: number,
    data: MedicoUpdate
  ): Observable<MedicoOut> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/personal-atencion/${medicoId}`, data).pipe(
      tap(() => this.refrescarMedicos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarMedico(medicoId: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/personal-atencion/${medicoId}`).pipe(
      tap(() => this.refrescarMedicos()),
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
  ): Observable<MedicoOut> {
    return this.actualizarMedico(medicoId, { activo });
  }
}
