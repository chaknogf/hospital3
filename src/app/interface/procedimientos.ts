// interfaces/procedimientos.interface.ts

export interface Procedimiento {
  id: number;
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
}

export interface ProcedimientoCreate {
  abreviatura?: string | null;
  nombre: string;
  descripcion?: string | null;
  anestesia?: number | null;
}

export interface ProcedimientoUpdate {
  abreviatura?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  anestesia?: number | null;
}

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

export interface ProcedimientosListResponse {
  total: number;
  procedimientos: ProceMedico[];
}

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
