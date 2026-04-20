// paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { Paciente, PacienteListResponse, Hijode, PacienteJoin } from '../../interface/interfaces';

@Injectable({ providedIn: 'root' })
export class PacienteService extends BaseApiService {

  // ======= BEHAVIOR SUBJECTS =======
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  pacientes$ = this.pacientesSubject.asObservable();

  // ======= ESTADO DE PAGINACIÓN =======
  private ultimoFiltroPaciente: PaginationState = {
    filtro: { skip: 0, limit: 14 }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ======= PRIVADOS =======

  private refrescarPacientes(): void {
    this.getPacientes(this.ultimoFiltroPaciente.filtro).subscribe();
  }

  // ======= CRUD PACIENTES =======

  getPacientes(filtros: any): Observable<PacienteListResponse> {
    this.ultimoFiltroPaciente.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<PacienteListResponse>(
      `${this.baseUrl}/pacientes/`,
      { params }
    ).pipe(
      tap(response => this.pacientesSubject.next(response.pacientes)),
      catchError(error => this.manejarError(error, 'obtener pacientes'))
    );
  }

  buscarPaciente(q: any): Observable<PacienteListResponse> {
    const params = this.limpiarParametros(q);

    return this.http.get<PacienteListResponse>(
      `${this.baseUrl}/pacientes/buscar/`,
      { params }
    ).pipe(
      tap(response => this.pacientesSubject.next(response.pacientes)),
      catchError(error => this.manejarError(error, 'buscar pacientes'))
    );
  }

  getPaciente(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/pacientes/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener paciente'))
    );
  }

  pacienteExpediente(expediente: string): Observable<PacienteJoin> {
    return this.http.get<PacienteJoin>(
      `${this.baseUrl}/pacientes/expediente/${expediente}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener paciente por expediente'))
    );
  }

  crearPaciente(paciente: Paciente, generar_expediente: boolean = false): Observable<any> {
    this.isLoading.set(true);

    const url = generar_expediente
      ? `${this.baseUrl}/pacientes/?gen_expediente=true`
      : `${this.baseUrl}/pacientes`;

    return this.http.post<any>(url, paciente).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'crear paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updatePaciente(
    pacienteId: number,
    paciente: any,
    accion: string = 'mantener'
  ): Observable<any> {
    this.isLoading.set(true);

    return this.http.patch<any>(
      `${this.baseUrl}/pacientes/${pacienteId}?accion=${accion}`,
      paciente
    ).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'actualizar paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deletePaciente(pacienteId: number): Observable<any> {
    this.isLoading.set(true);

    return this.http.delete<any>(
      `${this.baseUrl}/paciente/eliminar/${pacienteId}`
    ).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'eliminar paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= RELACIONES =======

  /**
   * Registra un recién nacido vinculado a una madre
   * POST /fah/pacientes/madre-hijo/{idMadre}
   */
  hijoDe(paciente: Hijode, idMadre: number): Observable<any> {
    this.isLoading.set(true);

    const payload = {
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
      estado: paciente.estado,
      datos_extra: paciente.datos_extra || {}
    };

    return this.http.post<any>(
      `${this.baseUrl}/fah/pacientes/madre-hijo/${idMadre}?auto_expediente=true`,
      payload
    ).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'registrar hijo')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= CORRELATIVOS RELACIONADOS CON PACIENTE =======

  corExpediente(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/expediente`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de expediente'))
    );
  }

  corEmergencia(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/emergencia`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de emergencia'))
    );
  }

  // ======= RENAP =======

  getRenapITD(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);

    return this.http.get<{ resultado: any }>(
      `${this.baseUrl}/renap-persona`,
      { params }
    ).pipe(
      tap(response => response.resultado),
      catchError(error => this.manejarError(error, 'obtener datos RENAP'))
    );
  }
}
