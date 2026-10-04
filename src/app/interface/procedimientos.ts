// interfaces/procedimientos.interface.ts

/** Procedimiento disponible en el catálogo institucional (legacy). */
export interface Procedimiento {
  id: number;
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
}

/** Procedimiento estandarizado (catálogo maestro unificado). */
export interface CatalogoProcedimiento {
  id: number;
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
  especialidad_ref?: number | null;
  activo?: boolean;
}

/** Cantidades de un grupo de edad separadas por sexo. */
export interface GrupoEdadCantidades {
  m: number;
  f: number;
}

/** Desglose de un registro: {"NEO": { m: 2, f: 1 }, "ADO": { m: 0, f: 3 }}. */
export type GrupoEdadDetalle = Partial<Record<GrupoEdad, GrupoEdadCantidades>>;

/** Grupo de edad (IMCI/OMS) admitido en un registro de procedimiento. */
export type GrupoEdad = 'NEO' | 'LAC' | 'PRI' | 'SEG' | 'ADO' | 'ADU' | 'ADM';

/** Grupo de edad con su etiqueta descriptiva. */
export interface GrupoEdadItem {
  codigo: GrupoEdad;
  nombre: string;
}

/** Áreas del cuerpo donde se interviene (FK). */
export interface AreaCuerpoIntervenida {
  id: number;
  codigo: string;
  nombre: string;
  region?: string | null;
  descripcion?: string | null;
  activo?: boolean;
}

/** Campos para incorporar un procedimiento al catálogo. */
export interface ProcedimientoCreate {
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
}

/** Campos opcionales para modificar una entrada del catálogo. */
export interface ProcedimientoUpdate {
  abreviatura?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  anestesia?: number | null;
}

/** Procedimiento realizado, con contexto de servicio y responsable. */
export interface ProceMedico {
  id: number;
  fecha?: string | null;
  lugar_servicio?: string | null;
  sexo?: 'M' | 'F' | null;
  id_procedimiento?: number | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  cantidad: number;
  responsable?: string | null;
  anestesia?: number | null;
  grupo_edad_detalle?: GrupoEdadDetalle | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  procedimiento?: Procedimiento | null;
  catalogo?: CatalogoProcedimiento | null;
  area_cuerpo?: AreaCuerpoIntervenida | null;
}

/** Datos para registrar un procedimiento realizado. */
export interface ProceMedicoCreate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  id_procedimiento?: number | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  responsable?: string | null;
  anestesia?: number | null;
  grupo_edad_detalle: GrupoEdadDetalle;
  created_by?: string | null;
}

/** Cambios parciales de un procedimiento realizado. */
export interface ProceMedicoUpdate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  id_procedimiento?: number | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  responsable?: string | null;
  anestesia?: number | null;
  grupo_edad_detalle?: GrupoEdadDetalle | null;
  created_by?: string | null;
}

/** Procedimiento más usado dentro de una especialidad, para la hoja de captura. */
export interface ProcedimientoMasUsado {
  especialidad_id: number | null;
  especialidad: string | null;
  especialidad_nombre: string | null;
  id_catalogo_procedimiento: number;
  abreviatura?: string | null;
  nombre: string;
  total_cantidad: number;
  total_registros: number;
  total_anestesia: number;
  posicion: number;
}

/** Listado de procedimientos realizados con total para paginación. */
export interface ProcedimientosListResponse {
  total: number;
  procedimientos: ProceMedico[];
}

/** Filtros temporales, de servicio y especialidad de procedimientos realizados. */
export interface ProceMedicoFiltros {
  skip?: number;
  limit?: number;
  especialidad?: string;
  lugar_servicio?: string;
  id_procedimiento?: number;
  id_catalogo_procedimiento?: number;
  id_area_cuerpo_intervenida?: number;
  mes?: number;
  anio?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}
