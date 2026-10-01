import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BaseApiService } from '../service/base-api.service';
import { PacienteListResponse } from '../interface/interfaces';
import { ConsultaListResponse } from '../interface/consultas';

/** Cliente de reportes y consultas estadísticas con filtros y paginación. */
@Injectable({ providedIn: 'root' })
export class EstadisticasService extends BaseApiService {

  // ── Pacientes atendidos ─────────────────────────────────
  getPacientesAtendidos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/pacientesAtendidos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener pacientes atendidos'))
    );
  }

  // ── Hospitalización infantil ─────────────────────────────
  getHospitalizacionInfantil(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/hospitalizacion-infantil`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener hospitalización infantil'))
    );
  }

  // ── Promedio diario ─────────────────────────────────────
  getPromedioDiario(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/promedioDiario`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener promedio diario'))
    );
  }

  // ── Personal hospital ───────────────────────────────────
  getPersonalHospital(desde: string, hasta: string, skip = 0, limit = 100): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/personal-hospital`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener personal hospital'))
    );
  }

  // ── Personal hospital (pacientes) ───────────────────────
  getPersonalHospitalPacientes(filtros: {
    skip?: number;
    limit?: number;
    expediente?: string | null;
    cui?: string | null;
    primer_nombre?: string | null;
    segundo_nombre?: string | null;
    primer_apellido?: string | null;
    segundo_apellido?: string | null;
  } = {}): Observable<PacienteListResponse> {
    const { skip = 0, limit = 50, ...rest } = filtros;
    let params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    for (const [key, value] of Object.entries(rest)) {
      if (value != null && value !== '') {
        params = params.set(key, value);
      }
    }
    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/personal-hospital`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener lista personal hospital'))
    );
  }

  // ── Estudiante público ──────────────────────────────────
  getEstudiantePublico(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/estudiante-publico`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estudiante público'))
    );
  }

  // ── Reingresos ──────────────────────────────────────────
  getReingresos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/reingresos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reingresos'))
    );
  }

  getReingresosTipo3(skip = 0, limit = 50): Observable<ConsultaListResponse> {
    this.isLoading.set(true);
    const params = new HttpParams().set('skip', String(skip)).set('limit', String(limit));
    return this.http.get<ConsultaListResponse>(`${this.baseUrl}/estadisticas/consultas/reingresos-tipo3`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reingresos tipo 3'))
    );
  }

  // ── Activos >7 días ─────────────────────────────────────
  getActivosMayores7Dias(skip = 0, limit = 50): Observable<ConsultaListResponse> {
    this.isLoading.set(true);
    const params = new HttpParams().set('skip', String(skip)).set('limit', String(limit));
    return this.http.get<ConsultaListResponse>(`${this.baseUrl}/estadisticas/consultas/mayores-a-7-dias`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener activos >7 días'))
    );
  }

  // ── Indicadores de consultas (jsonb consultas.indicadores) ──
  getIndicadoresConsultas(filtros: {
    desde: string;
    hasta: string;
    tipo_consulta?: number | null;
    especialidad?: string | null;
    top_referencias?: number | null;
  }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/indicadores`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener indicadores de consultas'))
    );
  }

  /**
   * Proyecta el indicador `personal_hospital` del paciente a las consultas del
   * periodo y funde el alias histórico `empleado_publico`.
   */
  sincronizarIndicadores(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.patch<any>(`${this.baseUrl}/consultas/sincronizar-indicadores`, null, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'sincronizar indicadores'))
    );
  }

  // ── Referencias de consultas (viene_referido_de / va_referido_a) ──
  getReferenciasConsultas(filtros: {
    desde: string;
    hasta: string;
    tipo_consulta?: number | null;
    especialidad?: string | null;
    skip?: number;
    limit?: number;
  }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/referencias`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener referencias de consultas'))
    );
  }

  // ── Estadísticas nacimientos ────────────────────────────
  getEstadisticasNacimientos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/nacimientos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estadísticas de nacimientos'))
    );
  }

  // ── Reporte procedimientos ──────────────────────────────
  getReporteProcedimientos(filtros: {
    desde?: string; hasta?: string; especialidad?: string;
    lugar_servicio?: string; sexo?: string;
  }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(`${this.baseUrl}/procedimientos/reporte`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reporte de procedimientos'))
    );
  }

  getResumenProcedimientos(filtros?: { anio?: number; mes?: number; nombre?: string | null }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros || {});
    return this.http.get<any>(`${this.baseUrl}/procedimientos/estadisticas/resumen`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener resumen de procedimientos'))
    );
  }
}
