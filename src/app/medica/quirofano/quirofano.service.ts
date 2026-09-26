import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { BaseApiService } from '../../service/base-api.service';
import {
  FormatoProcedimiento,
  EstadoCirugia,
  RangoEspecialista,
  ProcedenciaProcedimiento,
  Especialidad,
  ProcedimientoQuirofano,
  QuirofanoNumero,
  IntervencionQuirurgica,
  IntervencionCreate,
  IntervencionUpdate,
  IntervencionListResponse,
} from '../../interface/quirofano.interface';

/** Centraliza el acceso a las consultas de programación e intervención quirúrgica. */
@Injectable({ providedIn: 'root' })
export class QuirofanoService extends BaseApiService {

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ══════════════════════════════════════════════════════════
  // CATÁLOGOS QUIROFANO
  // ══════════════════════════════════════════════════════════
  getFormatos(activos = true): Observable<FormatoProcedimiento[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/formatos/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<FormatoProcedimiento[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener formatos'))
    ));
  }

  getEstadosCirugia(activos = true): Observable<EstadoCirugia[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/estados-cirugia/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<EstadoCirugia[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estados de cirugía'))
    ));
  }

  getRangosEspecialista(activos = true): Observable<RangoEspecialista[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/rangos-especialista/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<RangoEspecialista[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener rangos de especialista'))
    ));
  }

  getProcedencias(activos = true): Observable<ProcedenciaProcedimiento[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/procedencias/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<ProcedenciaProcedimiento[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener procedencias'))
    ));
  }

  getQuirofanosNumero(activos = true): Observable<QuirofanoNumero[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/quirofanos-numero/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<QuirofanoNumero[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener números de quirófano'))
    ));
  }

  getEspecialidades(): Observable<Especialidad[]> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/especialidades/`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<Especialidad[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener especialidades'))
    ));
  }

  getProcedimientosQuirofano(especialidadId?: number, q?: string, activos = true): Observable<ProcedimientoQuirofano[]> {
    this.isLoading.set(true);
    const params: any = { activos };
    if (especialidadId) params.especialidad_id = especialidadId;
    if (q) params.q = q;
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/?${new URLSearchParams(params).toString()}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<ProcedimientoQuirofano[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener procedimientos de quirófano'))
    ));
  }

  crearProcedimientoQuirofano(data: any): Observable<ProcedimientoQuirofano> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/`;
    return this.offMutation('POST', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<ProcedimientoQuirofano>;
  }

  actualizarProcedimientoQuirofano(id: number, data: any): Observable<ProcedimientoQuirofano> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/${id}`;
    return this.offMutation('PUT', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<ProcedimientoQuirofano>;
  }

  eliminarProcedimientoQuirofano(id: number): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/${id}`;
    return this.offMutation('DELETE', url).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  importarProcedimientosCsv(file: File): Observable<any> {
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('file', file, file.name);
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/importar-csv`;
    return this.http.post(url, formData).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'importar procedimientos de quirófano'))
    );
  }

  truncarProcedimientos(): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/procedimientos-quirofano/truncar`;
    return this.http.delete(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'vaciar procedimientos de quirófano'))
    );
  }

  // ══════════════════════════════════════════════════════════
  // INTERVENCIONES QUIRÚRGICAS
  // ══════════════════════════════════════════════════════════
  getIntervenciones(params: any = {}): Observable<IntervencionListResponse> {
    this.isLoading.set(true);
    const clean: any = {};
    for (const key in params) {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') clean[key] = val;
    }
    const qp = new URLSearchParams(clean).toString();
    const url = `${this.baseUrl}/quirofano/intervenciones?${qp}`;
    const key = this.cacheKey(url, clean);
    return this.cacheGet(key,
      this.http.get<IntervencionListResponse>(url).pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(error => this.manejarError(error, 'obtener intervenciones'))
      ),
      30 * 1000
    );
  }

  getIntervencion(id: number): Observable<IntervencionQuirurgica> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/intervenciones/${id}`;
    return this.http.get<IntervencionQuirurgica>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener intervención'))
    );
  }

  crearIntervencion(data: IntervencionCreate): Observable<IntervencionQuirurgica> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/intervenciones/`;
    return this.offMutation('POST', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<IntervencionQuirurgica>;
  }

  actualizarIntervencion(id: number, data: IntervencionUpdate): Observable<IntervencionQuirurgica> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/intervenciones/${id}`;
    return this.offMutation('PUT', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<IntervencionQuirurgica>;
  }

  eliminarIntervencion(id: number): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/intervenciones/${id}`;
    return this.offMutation('DELETE', url).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
