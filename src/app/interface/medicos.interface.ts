// ======= INTERFACES =======

export interface MedicoOut {
  id: number;
  nombre: string;
  colegiado?: string;
  especialidad?: string;
  activo: boolean;
  telefono?: string;
  direccion?: string;
}

export interface MedicoCreate {
  nombre: string;
  colegiado?: string;
  especialidad?: string;
  activo?: boolean;
  telefono?: string;
  direccion?: string;
}

export interface MedicoUpdate {
  nombre?: string;
  colegiado?: string;
  especialidad?: string;
  activo?: boolean;
  telefono?: string;
  direccion?: string;
}

export interface FiltroMedico {
  id?: number;
  activo?: boolean;
  nombre?: string;
  colegiado?: string;
  especialidad?: string;
  limit?: number;
}
export interface Medico {
  id?: number;
  nombre: string;
  colegiado: string;
  dpi: number;
  sexo: string;
  especialidad: string;
  activo: boolean;
  created_at?: string;
}
