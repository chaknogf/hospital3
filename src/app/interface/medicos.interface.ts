/** Datos de salida de un médico/personal de atención. */
export interface MedicoOut {
  id: number;
  nombre: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  especialidad_nombre?: string;
  activo: boolean;
  dpi?: bigint;
  sexo?: string;
}

/** Campos para crear un médico en el catálogo de atención. */
export interface MedicoCreate {
  nombre: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

/** Campos opcionales modificables de un médico. */
export interface MedicoUpdate {
  nombre?: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

/** Criterios de búsqueda y paginación del catálogo de médicos. */
export interface FiltroMedico {
  id?: number;
  activo?: boolean;
  nombre?: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  skip?: number;
  limit?: number;
}

/** Respuesta paginada del catálogo de personal de atención. */
export interface MedicoListResponse {
  total: number;
  personal_atencion: MedicoOut[];
}

/** Modelo de médico usado por formularios y listados del frontend. */
export interface Medico {
  id?: number;
  nombre: string;
  colegiado?: string;
  pasaporte?: string;
  dpi: bigint;
  sexo: string;
  especialidad_id?: number;
  especialidad_nombre?: string;
  activo: boolean;
  created_at?: string;
}
