// consulta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroConsulta } from '../../interface/filtros.model';
import {
  ConsultaOut,
  ConsultaResponse,
  ConsultaUpdate,
  ConsultasIdPaciente,
  CicloClinico,
  EstadoCiclo,
  Egreso,
  Indicador,
  RegistroConsultaCreate,
  RegistroConsultaResponse,
  SignosVitales,
  TotalesItem,
  TotalesResponse,
} from '../../interface/consultas';

@Injectable({ providedIn: 'root' })
export class ConsultaService extends BaseApiService {

  // ======= BEHAVIOR SUBJECTS =======
  private consultasSubject = new BehaviorSubject<ConsultaResponse[]>([]);
  consultas$ = this.consultasSubject.asObservable();

  private ordenesSubject = new BehaviorSubject<any>({});
  ordenes$ = this.ordenesSubject.asObservable();

  // ======= ESTADO DE PAGINACIÓN =======
  private ultimoFiltroConsulta: PaginationState = {
    filtro: { skip: 0, limit: 8 }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ======= PRIVADOS =======

  private refrescarConsultas(): void {
    this.getConsultas(this.ultimoFiltroConsulta.filtro).subscribe();
  }

  // ======= UTILIDADES =======

  /**
   * Envía órdenes al BehaviorSubject (funcionalidad legacy)
   */
  enviarOrdenes(ordenes: any): void {
    this.ordenesSubject.next(ordenes);
  }

  // ======= CONSULTAS — LECTURA =======

  /**
   * Lista consultas con filtros múltiples
   * GET /consultas/
   */
  getConsultas(filtros: FiltroConsulta): Observable<ConsultaOut[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<ConsultaOut[]>(
      `${this.baseUrl}/consultas/`,
      { params }
    ).pipe(
      tap(response => this.consultasSubject.next(response as any)),
      catchError(error => this.manejarError(error, 'obtener consultas'))
    );
  }

  /**
   * Lista consultas activas con filtros
   * GET /consultas/activas
   */
  getConsultasActivas(filtros: FiltroConsulta): Observable<ConsultaOut[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<ConsultaOut[]>(
      `${this.baseUrl}/consultas/activas`,
      { params }
    ).pipe(
      tap(response => this.consultasSubject.next(response as any)),
      catchError(error => this.manejarError(error, 'obtener consultas activas'))
    );
  }

  /**
   * Lista consultas de un paciente específico
   * GET /consultas/pacienteId/{pacienteId}
   */
  getConsultasPorPaciente(
    pacienteId: number,
    filtros?: FiltroConsulta
  ): Observable<ConsultasIdPaciente[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros ?? {});

    return this.http.get<ConsultasIdPaciente[]>(
      `${this.baseUrl}/consultas/pacienteId/${pacienteId}`,
      { params }
    ).pipe(
      tap(response => this.consultasSubject.next(response as any)),
      catchError(error => this.manejarError(error, 'obtener consultas por paciente'))
    );
  }

  /**
   * Obtiene la primera consulta que coincida con los filtros
   * GET /consultas/
   */
  getConsulta(filtros: FiltroConsulta): Observable<ConsultaOut | null> {
    const params = this.limpiarParametros(filtros);

    return this.http.get<ConsultaOut[]>(
      `${this.baseUrl}/consultas/`,
      { params }
    ).pipe(
      map(consultas => consultas?.length > 0 ? consultas[0] : null),
      catchError(error => this.manejarError(error, 'obtener consulta'))
    );
  }

  /**
   * Obtiene una consulta por su ID
   * GET /consultas/{consultaId}
   */
  getConsultaId(consultaId: number): Observable<ConsultaOut> {
    return this.http.get<ConsultaOut>(
      `${this.baseUrl}/consultas/${consultaId}`
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener consulta por ID'))
    );
  }

  // ======= CONSULTAS — ESCRITURA =======

  /**
   * Registro rápido de consulta (admisión)
   * El backend genera automáticamente: expediente, documento, fecha/hora, ciclo inicial, orden
   * POST /consultas/registro
   */
  registrarAdmision(datos: RegistroConsultaCreate): Observable<RegistroConsultaResponse> {
    this.isLoading.set(true);

    return this.http.post<RegistroConsultaResponse>(
      `${this.baseUrl}/consultas/registro`,
      datos
    ).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'registrar admisión')),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Actualiza una consulta (PATCH)
   * IMPORTANTE: Si envías 'ciclo', se AGREGA al historial, no sobrescribe
   * PATCH /consultas/{consultaId}
   */
  updateConsulta(consultaId: number, datos: ConsultaUpdate): Observable<ConsultaOut> {
    this.isLoading.set(true);

    return this.http.patch<ConsultaOut>(
      `${this.baseUrl}/consultas/${consultaId}`,
      datos
    ).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'actualizar consulta')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= CICLO CLÍNICO =======

  /**
   * Agrega un nuevo registro al ciclo clínico
   * El backend automáticamente agrega: registro (timestamp), usuario
   */
  agregarCiclo(
    consultaId: number,
    estado: EstadoCiclo,
    datosCiclo?: Partial<CicloClinico>
  ): Observable<ConsultaOut> {
    const ciclo: Partial<CicloClinico> = { estado, ...datosCiclo };
    return this.updateConsulta(consultaId, { ciclo: ciclo as CicloClinico });
  }

  /**
   * Cambia el estado de la consulta sin datos adicionales
   */
  cambiarEstado(consultaId: number, estado: EstadoCiclo): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, estado);
  }

  /**
   * Registra signos vitales en el ciclo
   */
  registrarSignosVitales(
    consultaId: number,
    signos: SignosVitales
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'signos', {
      signos_vitales: signos
    });
  }

  /**
   * Completa la consulta médica con diagnóstico y tratamiento
   */
  completarConsulta(
    consultaId: number,
    datos: {
      impresion_clinica?: any;
      tratamiento?: any;
      ordenes?: any;
      estudios?: any;
    }
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'consulta', datos);
  }

  /**
   * Registra egreso del paciente
   */
  registrarEgreso(consultaId: number, egreso: Egreso): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'egreso', { egreso });
  }

  /**
   * Actualiza indicadores (merge con los existentes)
   */
  actualizarIndicadores(
    consultaId: number,
    indicadores: Partial<Indicador>
  ): Observable<ConsultaOut> {
    return this.updateConsulta(consultaId, {
      indicadores: indicadores as Indicador
    });
  }

  // ======= TOTALES =======

  getTotales(fecha?: string): Observable<TotalesResponse> {
    const params = fecha ? this.limpiarParametros({ fecha }) : undefined;

    return this.http.get<TotalesResponse>(
      `${this.baseUrl}/totales/`,
      { params }
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener totales'))
    );
  }

  getTotalesArray(fecha?: string): Observable<TotalesItem[]> {
    return this.getTotales(fecha).pipe(
      map(response => response.totales)
    );
  }

  // ======= CORRELATIVOS RELACIONADOS CON CONSULTA =======

  corConstanciaMedica(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_medica`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de constancia médica'))
    );
  }

  corDefuncion(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_defuncion`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de defunción'))
    );
  }
}
