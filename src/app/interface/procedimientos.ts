// interfaces/procedimientos.interface.ts

/** Procedimiento disponible en el catálogo institucional (alias del catálogo maestro). */
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
  especialidades_ids?: number[];
  activo?: boolean;
}

/** Cantidades de una categoría etaria separadas por sexo. */
export interface GrupoEdadCantidades {
  m: number;
  f: number;
}

/** Categoría etaria admitida en un registro de procedimiento (corte a los 18 años). */
export type CategoriaEdad = 'nino' | 'adulto' | 'sin_edad';

/** Categoría etaria con su etiqueta descriptiva. */
export interface CategoriaEdadItem {
  codigo: CategoriaEdad;
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

/** Procedimiento realizado, con su desglose niño/adulto × sexo y contexto de servicio. */
export interface ProceMedico {
  id: number;
  fecha?: string | null;
  lugar_servicio?: string | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  cantidad: number;
  responsable?: string | null;
  anestesia?: number | null;
  nino_m: number;
  nino_f: number;
  adulto_m: number;
  adulto_f: number;
  sin_edad_m: number;
  sin_edad_f: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  catalogo?: CatalogoProcedimiento | null;
  area_cuerpo?: AreaCuerpoIntervenida | null;
}

/** Datos para registrar un procedimiento realizado. */
export interface ProceMedicoCreate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  responsable?: string | null;
  anestesia?: number | null;
  nino_m?: number;
  nino_f?: number;
  adulto_m?: number;
  adulto_f?: number;
  created_by?: string | null;
}

/** Cambios parciales de un procedimiento realizado. */
export interface ProceMedicoUpdate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  id_catalogo_procedimiento?: number | null;
  id_area_cuerpo_intervenida?: number | null;
  especialidad?: string | null;
  especialidad_id?: number | null;
  responsable?: string | null;
  anestesia?: number | null;
  nino_m?: number;
  nino_f?: number;
  adulto_m?: number;
  adulto_f?: number;
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
  lugar_servicio: string | null;
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
  id_catalogo_procedimiento?: number;
  id_area_cuerpo_intervenida?: number;
  categoria?: CategoriaEdad;
  mes?: number;
  anio?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}