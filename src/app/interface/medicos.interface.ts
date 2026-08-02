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

export interface MedicoCreate {
  nombre: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

export interface MedicoUpdate {
  nombre?: string;
  colegiado?: string;
  pasaporte?: string;
  especialidad_id?: number;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

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

export interface MedicoListResponse {
  total: number;
  medicos: MedicoOut[];
}

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
