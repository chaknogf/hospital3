// interfaces/procedimientos.interface.ts

/** Procedimiento disponible en el catálogo institucional. */
export interface Procedimiento {
  id: number;
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
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
  especialidad?: string | null;
  cantidad: number;
  responsable?: string | null;
  anestesia?: number | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  procedimiento?: Procedimiento | null;
}

/** Datos para registrar un procedimiento realizado. */
export interface ProceMedicoCreate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  sexo?: 'M' | 'F' | null;
  id_procedimiento?: number | null;
  especialidad?: string | null;
  cantidad: number;
  responsable?: string | null;
  anestesia?: number | null;
  created_by?: string | null;
}

/** Cambios parciales de un procedimiento realizado. */
export interface ProceMedicoUpdate {
  fecha?: string | null;
  lugar_servicio?: string | null;
  sexo?: 'M' | 'F' | null;
  id_procedimiento?: number | null;
  especialidad?: string | null;
  cantidad?: number | null;
  responsable?: string | null;
  anestesia?: number | null;
  created_by?: string | null;
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
  mes?: number;
  anio?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}
