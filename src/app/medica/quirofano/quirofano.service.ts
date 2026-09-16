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
  CategoriaProcedimiento,
  TipoProcedimiento,
  QuirofanoNumero,
  IntervencionQuirurgica,
  IntervencionCreate,
  IntervencionUpdate,
  IntervencionListResponse,
} from '../../interface/quirofano.interface';

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

  getCategorias(activos = true): Observable<CategoriaProcedimiento[]> {    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/categorias/?activos=${activos}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<CategoriaProcedimiento[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener categorías'))
    ));
  }

  getTiposProcedimiento(categoriaId?: number, q?: string, activos = true): Observable<TipoProcedimiento[]> {
    this.isLoading.set(true);
    const params: any = { activos };
    if (categoriaId) params.categoria_id = categoriaId;
    if (q) params.q = q;
    const url = `${this.baseUrl}/quirofano/tipos/?${new URLSearchParams(params).toString()}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key, this.http.get<TipoProcedimiento[]>(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener tipos de procedimiento'))
    ));
  }

  crearTipoProcedimiento(data: any): Observable<TipoProcedimiento> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/tipos/`;
    return this.offMutation('POST', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<TipoProcedimiento>;
  }

  actualizarTipoProcedimiento(id: number, data: any): Observable<TipoProcedimiento> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/tipos/${id}`;
    return this.offMutation('PUT', url, data).pipe(
      finalize(() => this.isLoading.set(false))
    ) as Observable<TipoProcedimiento>;
  }

  eliminarTipoProcedimiento(id: number): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/tipos/${id}`;
    return this.offMutation('DELETE', url).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  importarTiposCsv(file: File): Observable<any> {
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('file', file, file.name);
    const url = `${this.baseUrl}/quirofano/tipos/importar-csv`;
    return this.http.post(url, formData).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'importar tipos de procedimiento'))
    );
  }

  truncarTipos(): Observable<any> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/quirofano/tipos/truncar`;
    return this.http.delete(url).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'vaciar tipos de procedimiento'))
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