export type TipoAlmacen = 'bodega' | 'farmacia' | 'productos_afines' | 'servicio';

export interface InsumoCreate { renglon: string; codigo_insumo: string; nombre: string; caracteristicas?: string; activo?: boolean; }
export interface Insumo {
  id: number;
  renglon: string;
  codigo_insumo: string;
  nombre: string;
  caracteristicas: string;
  caracteristicas_jsonb?: Record<string, string>;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsumoDetalle extends Insumo {
  presentaciones: Presentacion[];
}

export interface InsumoListResponse { total: number; items: Insumo[]; }

export interface PresentacionCreate { insumo_id: number; nombre: string; cantidad_unidad?: string; codigo_presentacion: string; activo?: boolean; }
export interface Presentacion {
  id: number;
  insumo_id: number;
  nombre: string;
  cantidad_unidad: string;
  cantidad_unidad_valor?: number | null;
  unidad_medida?: string | null;
  codigo_presentacion: string;
  activo: boolean;
  /** Etiquetas del insumo padre resueltas por el backend. */
  insumo_nombre?: string | null;
  insumo_codigo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresentacionListResponse { total: number; items: Presentacion[]; }

export interface AlmacenCreate { codigo: string; nombre: string; tipo: TipoAlmacen; activo?: boolean; }
export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoAlmacen;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlmacenListResponse { total: number; items: Almacen[]; }

export interface Lote {
  id: number;
  presentacion_id: number;
  almacen_id: number;
  numero_lote: string;
  fecha_vencimiento?: string | null;
  cantidad_actual: number;
  costo_unitario: number;
  activo: boolean;
  /** Etiquetas resueltas por el backend. */
  almacen_nombre?: string | null;
  presentacion_codigo?: string | null;
  presentacion_nombre?: string | null;
  cantidad_unidad?: string | null;
  insumo_nombre?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoteListResponse { total: number; items: Lote[]; }

export interface LoteIngresoCreate {
  presentacion_id: number;
  almacen_id: number;
  numero_lote: string;
  fecha_vencimiento?: string | null;
  cantidad: number;
  costo_unitario: number;
  observacion?: string;
}

export interface LoteAjusteCreate { lote_id: number; cantidad_nueva: number; observacion?: string; }

export interface Kardex {
  id: number;
  lote_id: number;
  almacen_id: number;
  tipo_movimiento: string;
  cantidad: number;
  saldo_resultante: number;
  costo_unitario: number;
  referencia_tipo?: string | null;
  referencia_id?: number | null;
  observacion: string;
  usuario_id?: number | null;
  fecha: string;
  /** Etiquetas resueltas por el backend. */
  lote_numero?: string | null;
  insumo_nombre?: string | null;
  presentacion_nombre?: string | null;
  almacen_nombre?: string | null;
}

export interface KardexListResponse { total: number; items: Kardex[]; }

export interface RequisicionDetalle {
  id: number;
  presentacion_id: number;
  cantidad_solicitada: number;
  cantidad_despachada: number;
  presentacion_codigo?: string | null;
  presentacion_nombre?: string | null;
  cantidad_unidad?: string | null;
  insumo_nombre?: string | null;
  created_at: string;
}
export interface RequisicionDetalleCreate { presentacion_id: number; cantidad_solicitada: number; }
export interface RequisicionCreate { servicio_solicitante_id: number; numero?: string; personal_solicita_id?: number; observaciones?: string; detalles: RequisicionDetalleCreate[]; }
export interface Requisicion { id: number; numero: string; servicio_solicitante_id: number; servicio_solicitante_nombre?: string | null; personal_solicita_id?: number | null; usuario_solicita_id?: number | null; estado: string; observaciones: string; usuario_aprueba_id?: number | null; fecha_aprobacion?: string | null; activo: boolean; created_at: string; updated_at: string; detalles: RequisicionDetalle[]; }
export interface RequisicionListResponse { total: number; items: Requisicion[]; }

export interface DespachoDetalle {
  id: number;
  lote_id: number;
  cantidad: number;
  costo_unitario: number;
  lote_numero?: string | null;
  presentacion_codigo?: string | null;
  presentacion_nombre?: string | null;
  insumo_nombre?: string | null;
  created_at: string;
}
export interface DespachoDetalleCreate { lote_id: number; cantidad: number; costo_unitario: number; }
export interface DespachoCreate { tipo: 'servicio' | 'paciente' | 'traslado'; almacen_origen_id: number; almacen_destino_id?: number; requisicion_id?: number; servicio_destino_id?: number; paciente_id?: number; personal_receptor_id?: number; numero?: string; observaciones?: string; detalles: DespachoDetalleCreate[]; }
export interface Despacho { id: number; numero: string; tipo: string; almacen_origen_id: number; almacen_origen_nombre?: string | null; almacen_destino_id?: number | null; almacen_destino_nombre?: string | null; requisicion_id?: number | null; servicio_destino_id?: number | null; servicio_destino_nombre?: string | null; paciente_id?: number | null; paciente_nombre?: string | null; personal_receptor_id?: number | null; usuario_despacha_id?: number | null; estado: string; fecha: string; observaciones: string; activo: boolean; created_at: string; updated_at: string; detalles: DespachoDetalle[]; }
export interface DespachoListResponse { total: number; items: Despacho[]; }

export interface AtencionInsumo { id: number; atencion_id: number; lote_id: number; despacho_id?: number | null; cantidad: number; origen: 'despacho' | 'directo'; usuario_id?: number | null; fecha: string; created_at: string; lote_numero?: string | null; presentacion_codigo?: string | null; presentacion_nombre?: string | null; cantidad_unidad?: string | null; insumo_nombre?: string | null; }
export interface AtencionInsumoCreate { lote_id: number; cantidad: number; origen: 'despacho' | 'directo'; despacho_id?: number; }
export interface Atencion { id: number; paciente_id: number; personal_atencion_id?: number | null; servicio_id?: number | null; consulta_id?: number | null; estado: string; fecha: string; observaciones: string; activo: boolean; created_at: string; updated_at: string; paciente_nombre?: string | null; servicio_nombre?: string | null; }
export interface AtencionDetalle extends Atencion { insumos_consumidos: AtencionInsumo[]; }
export interface AtencionListResponse { total: number; items: Atencion[]; }
export interface AtencionCreate { paciente_id: number; personal_atencion_id?: number; servicio_id?: number; consulta_id?: number; observaciones?: string; }

export interface UnidosisDetalle { id: number; unidosis_id: number; lote_id: number; cantidad: number; dosis: string; fecha_administracion?: string | null; created_at: string; lote_numero?: string | null; presentacion_codigo?: string | null; presentacion_nombre?: string | null; cantidad_unidad?: string | null; insumo_nombre?: string | null; }
export interface UnidosisDetalleCreate { lote_id: number; cantidad: number; dosis: string; }
export interface UnidosisCreate { paciente_id: number; almacen_origen_id: number; numero?: string; atencion_id?: number; personal_prepara_id?: number; observaciones?: string; detalles: UnidosisDetalleCreate[]; }
export interface Unidosis { id: number; numero?: string | null; paciente_id: number; atencion_id?: number | null; almacen_origen_id: number; personal_prepara_id?: number | null; usuario_prepara_id?: number | null; estado: string; fecha: string; observaciones: string; activo: boolean; created_at: string; updated_at: string; detalles: UnidosisDetalle[]; paciente_nombre?: string | null; almacen_origen_nombre?: string | null; }
export interface UnidosisListResponse { total: number; items: Unidosis[]; }
