// medicos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroMedico, MedicoCreate, MedicoOut, MedicoUpdate } from '../../interface/medicos.interface';



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

  // ======= GET =======

  /**
   * Lista médicos
   * GET /medicos
   */
  getMedicos(filtros?: FiltroMedico): Observable<MedicoOut[]> {
    this.ultimoFiltro.filtro = filtros ?? {};

    const params = this.limpiarParametros(filtros ?? {});
    const key = this.cacheKey(`${this.baseUrl}/medicos`, params);

    return this.cacheGet(key,
      this.http.get<MedicoOut[]>(
        `${this.baseUrl}/medicos`,
        { params }
      ).pipe(
        tap(medicos => this.medicosSubject.next(medicos)),
        catchError(error => this.manejarError(error, 'obtener médicos'))
      )
    );
  }

  /**
   * Obtiene todos los médicos (sin límite) para exportación
   */
  getAllMedicos(): Observable<MedicoOut[]> {
    const params = this.limpiarParametros({ skip: 0, limit: 500 });
    return this.http.get<MedicoOut[]>(
      `${this.baseUrl}/medicos`,
      { params }
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener todos los médicos'))
    );
  }

  /**
   * Obtiene un médico por ID
   * GET /medicos/{id}
   */
  getMedico(id: number): Observable<MedicoOut> {
    return this.http.get<MedicoOut>(
      `${this.baseUrl}/medicos/${id}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener médico'))
    );
  }

  /**
   * Busca primer médico que coincida
   */
  buscarMedico(filtros: FiltroMedico): Observable<MedicoOut | null> {
    const params = this.limpiarParametros(filtros);

    return this.http.get<MedicoOut[]>(
      `${this.baseUrl}/medicos`,
      { params }
    ).pipe(
      map(medicos => medicos?.length > 0 ? medicos[0] : null),
      catchError(error => this.manejarError(error, 'buscar médico'))
    );
  }

  // ======= POST =======

  /**
   * Crear médico
   * POST /medicos
   */
  crearMedico(data: MedicoCreate): Observable<MedicoOut> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/medicos`, data).pipe(
      tap(() => this.refrescarMedicos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  actualizarMedico(
    medicoId: number,
    data: MedicoUpdate
  ): Observable<MedicoOut> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/medicos/${medicoId}`, data).pipe(
      tap(() => this.refrescarMedicos()),
      finalize(() => this.isLoading.set(false))
    );
  }

  eliminarMedico(medicoId: number): Observable<void> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/medicos/${medicoId}`).pipe(
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
