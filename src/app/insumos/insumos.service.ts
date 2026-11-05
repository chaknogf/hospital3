import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BaseApiService } from '../service/base-api.service';
import {
  Insumo, InsumoDetalle, InsumoListResponse, InsumoCreate,
  Presentacion, PresentacionListResponse, PresentacionCreate,
  Almacen, AlmacenListResponse, AlmacenCreate,
  Lote, LoteListResponse, LoteIngresoCreate, LoteAjusteCreate,
  Kardex, KardexListResponse,
  Requisicion, RequisicionCreate, RequisicionListResponse,
  Despacho, DespachoCreate, DespachoListResponse,
  Atencion, AtencionDetalle, AtencionListResponse, AtencionCreate, AtencionInsumoCreate, AtencionInsumo,
  Unidosis, UnidosisCreate, UnidosisListResponse,
} from './insumos.model';

@Injectable({ providedIn: 'root' })
export class InsumosService extends BaseApiService {
  private readonly base = `${this.baseUrl}/insumos`;

  constructor(http: HttpClient, router: Router) { super(http, router); }

  // Catálogo
  listarInsumos(params?: any): Observable<InsumoListResponse> {
    return this.http.get<InsumoListResponse>(`${this.base}`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerInsumo(id: number): Observable<InsumoDetalle> { return this.http.get<InsumoDetalle>(`${this.base}/${id}`); }
  crearInsumo(body: InsumoCreate): Observable<Insumo> { return this.http.post<Insumo>(`${this.base}`, body); }
  actualizarInsumo(id: number, body: Partial<InsumoCreate>): Observable<Insumo> { return this.http.put<Insumo>(`${this.base}/${id}`, body); }
  eliminarInsumo(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  contarCatalogo(): Observable<{ total: number }> { return this.http.get<{ total: number }>(`${this.base}/contar`); }
  importarCsv(file: File): Observable<any> {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post(`${this.base}/importar-csv`, fd);
  }
  listarPresentaciones(params?: any): Observable<PresentacionListResponse> {
    return this.http.get<PresentacionListResponse>(`${this.base}/presentaciones`, { params: this.limpiarParametros(params || {}) });
  }
  crearPresentacion(body: PresentacionCreate): Observable<Presentacion> { return this.http.post<Presentacion>(`${this.base}/presentaciones`, body); }
  obtenerPresentacion(id: number): Observable<Presentacion> { return this.http.get<Presentacion>(`${this.base}/presentaciones/${id}`); }
  actualizarPresentacion(id: number, body: Partial<PresentacionCreate>): Observable<Presentacion> { return this.http.put<Presentacion>(`${this.base}/presentaciones/${id}`, body); }
  eliminarPresentacion(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/presentaciones/${id}`); }

  // Almacén
  listarAlmacenes(params?: any): Observable<AlmacenListResponse> {
    return this.http.get<AlmacenListResponse>(`${this.base}/almacenes`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerAlmacen(id: number): Observable<Almacen> { return this.http.get<Almacen>(`${this.base}/almacenes/${id}`); }
  crearAlmacen(body: AlmacenCreate): Observable<Almacen> { return this.http.post<Almacen>(`${this.base}/almacenes`, body); }
  actualizarAlmacen(id: number, body: Partial<AlmacenCreate>): Observable<Almacen> { return this.http.put<Almacen>(`${this.base}/almacenes/${id}`, body); }
  eliminarAlmacen(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/almacenes/${id}`); }
  listarLotes(params?: any): Observable<LoteListResponse> {
    return this.http.get<LoteListResponse>(`${this.base}/lotes`, { params: this.limpiarParametros(params || {}) });
  }
  ingresarLote(body: LoteIngresoCreate): Observable<Lote> { return this.http.post<Lote>(`${this.base}/lotes/ingreso`, body); }
  ajustarLote(body: LoteAjusteCreate): Observable<Lote> { return this.http.post<Lote>(`${this.base}/lotes/ajuste`, body); }
  listarKardex(params?: any): Observable<KardexListResponse> {
    return this.http.get<KardexListResponse>(`${this.base}/kardex`, { params: this.limpiarParametros(params || {}) });
  }
  kardexPorLote(loteId: number): Observable<KardexListResponse> { return this.http.get<KardexListResponse>(`${this.base}/kardex/lote/${loteId}`); }

  // Flujo
  crearRequisicion(body: RequisicionCreate): Observable<Requisicion> { return this.http.post<Requisicion>(`${this.base}/requisiciones`, body); }
  listarRequisiciones(params?: any): Observable<RequisicionListResponse> {
    return this.http.get<RequisicionListResponse>(`${this.base}/requisiciones`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerRequisicion(id: number): Observable<Requisicion> { return this.http.get<Requisicion>(`${this.base}/requisiciones/${id}`); }
  aprobarRequisicion(id: number, obs = ''): Observable<Requisicion> { return this.http.post<Requisicion>(`${this.base}/requisiciones/${id}/aprobar`, { observaciones: obs }); }
  rechazarRequisicion(id: number, obs = ''): Observable<Requisicion> { return this.http.post<Requisicion>(`${this.base}/requisiciones/${id}/rechazar`, { observaciones: obs }); }
  crearDespacho(body: DespachoCreate): Observable<Despacho> { return this.http.post<Despacho>(`${this.base}/despachos`, body); }
  listarDespachos(params?: any): Observable<DespachoListResponse> {
    return this.http.get<DespachoListResponse>(`${this.base}/despachos`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerDespacho(id: number): Observable<Despacho> { return this.http.get<Despacho>(`${this.base}/despachos/${id}`); }
  despachar(id: number): Observable<Despacho> { return this.http.post<Despacho>(`${this.base}/despachos/${id}/despachar`, {}); }
  anularDespacho(id: number): Observable<Despacho> { return this.http.post<Despacho>(`${this.base}/despachos/${id}/anular`, {}); }

  // Servicios (encamamiento) — para listados de destino
  listarServicios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/encamamiento`);
  }

  // Atenciones / Unidosis
  crearAtencion(body: AtencionCreate): Observable<Atencion> { return this.http.post<Atencion>(`${this.base}/atenciones`, body); }
  listarAtenciones(params?: any): Observable<AtencionListResponse> {
    return this.http.get<AtencionListResponse>(`${this.base}/atenciones`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerAtencion(id: number): Observable<AtencionDetalle> { return this.http.get<AtencionDetalle>(`${this.base}/atenciones/${id}`); }
  finalizarAtencion(id: number): Observable<Atencion> { return this.http.post<Atencion>(`${this.base}/atenciones/${id}/finalizar`, {}); }
  registrarInsumoAtencion(id: number, body: AtencionInsumoCreate): Observable<AtencionInsumo> {
    return this.http.post<AtencionInsumo>(`${this.base}/atenciones/${id}/insumos`, body);
  }
  crearUnidosis(body: UnidosisCreate): Observable<Unidosis> { return this.http.post<Unidosis>(`${this.base}/unidosis`, body); }
  listarUnidosis(params?: any): Observable<UnidosisListResponse> {
    return this.http.get<UnidosisListResponse>(`${this.base}/unidosis`, { params: this.limpiarParametros(params || {}) });
  }
  obtenerUnidosis(id: number): Observable<Unidosis> { return this.http.get<Unidosis>(`${this.base}/unidosis/${id}`); }
  administrarUnidosis(id: number): Observable<Unidosis> { return this.http.post<Unidosis>(`${this.base}/unidosis/${id}/administrar`, {}); }
  cancelarUnidosis(id: number): Observable<Unidosis> { return this.http.post<Unidosis>(`${this.base}/unidosis/${id}/cancelar`, {}); }
}
