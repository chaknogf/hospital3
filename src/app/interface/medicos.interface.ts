// ======= INTERFACES =======

export interface MedicoOut {
  id: number;
  nombre: string;
  colegiado?: string;
  especialidad?: string;
  activo: boolean;
  dpi?: bigint;
  sexo?: string;
}

export interface MedicoCreate {
  nombre: string;
  colegiado?: string;
  especialidad?: string;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

export interface MedicoUpdate {
  nombre?: string;
  colegiado?: string;
  especialidad?: string;
  activo?: boolean;
  dpi?: bigint;
  sexo?: string;
}

export interface FiltroMedico {
  id?: number;
  activo?: boolean;
  nombre?: string;
  colegiado?: string;
  especialidad?: string;
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
  colegiado: string;
  dpi: bigint;
  sexo: string;
  especialidad: string;
  activo: boolean;
  created_at?: string;
}
