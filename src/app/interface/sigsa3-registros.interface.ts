export interface Sigsa3Registro {
  id: number;
  paciente_id: number;
  medico_id?: number | null;
  personal_salud_id?: number | null;
  consulta_id?: number | null;
  fecha_consulta: string;
  tipo_consulta_id?: number | null;
  control?: string | null;
  semana_gestacional?: number | null;
  codigo_cie_10_id?: number | null;
  especialidad_id?: number | null;
  normalized_at?: string | null;
  paciente_nombre?: string | null;
  paciente_expediente?: string | null;
  sexo?: string | null;
  medico_nombre?: string | null;
  personal_salud_nombre?: string | null;
  tipo_consulta_nombre?: string | null;
  codigo_cie_10?: string | null;
  codigo_cie_10_descripcion?: string | null;
  especialidad_nombre?: string | null;
}

export interface Sigsa3RegistroCreate {
  paciente_id: number;
  medico_id?: number | null;
  personal_salud_id?: number | null;
  consulta_id?: number | null;
  fecha_consulta: string;
  tipo_consulta_id?: number | null;
  control?: string | null;
  semana_gestacional?: number | null;
  codigo_cie_10_id?: number | null;
  especialidad_id?: number | null;
}

export interface Sigsa3RegistroUpdate {
  paciente_id?: number;
  medico_id?: number | null;
  personal_salud_id?: number | null;
  consulta_id?: number | null;
  fecha_consulta?: string;
  tipo_consulta_id?: number | null;
  control?: string | null;
  semana_gestacional?: number | null;
  codigo_cie_10_id?: number | null;
  especialidad_id?: number | null;
}

export interface FiltroSigsa3Registro {
  q?: string;
  paciente_id?: number;
  medico_id?: number;
  personal_salud_id?: number;
  consulta_id?: number;
  tipo_consulta_id?: number;
  especialidad_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  skip?: number;
  limit?: number;
}

export interface Sigsa3RegistroListResponse {
  total: number;
  registros: Sigsa3Registro[];
}
