// sigsa3.interface.ts

export interface Sigsa3Out {
  id: number;
  paciente_id?: number | null;
  medico_id?: number | null;
  consulta_id?: number | null;
  personal_salud?: string | null;
  fecha_consulta?: string | null;
  no_historia_clinica?: string | null;
  nombre_paciente?: string | null;
  sexo?: string | null;
  edad_dias?: number | null;
  edad_meses?: number | null;
  edad_anios?: number | null;
  tipo_consulta?: string | null;
  control?: string | null;
  semana_gestacional?: number | null;
  codigo_cie_10?: string | null;
  dx?: string | null;
  especialidad?: string | null;
}

export interface Sigsa3Create {
  personal_salud?: string;
  fecha_consulta?: string;
  no_historia_clinica?: string;
  nombre_paciente?: string;
  sexo?: string;
  edad_dias?: number;
  edad_meses?: number;
  edad_anios?: number;
  tipo_consulta?: string;
  control?: string;
  semana_gestacional?: number;
  codigo_cie_10?: string;
  dx?: string;
  especialidad?: string;
  medico_id?: number;
  consulta_id?: number;
}

export interface Sigsa3Update {
  personal_salud?: string;
  fecha_consulta?: string;
  no_historia_clinica?: string;
  nombre_paciente?: string;
  sexo?: string;
  edad_dias?: number;
  edad_meses?: number;
  edad_anios?: number;
  tipo_consulta?: string;
  control?: string;
  semana_gestacional?: number;
  codigo_cie_10?: string;
  dx?: string;
  especialidad?: string;
  medico_id?: number;
  consulta_id?: number;
}

export interface FiltroSigsa3 {
  personal_salud?: string;
  fecha_consulta?: string;
  no_historia_clinica?: string;
  nombre_paciente?: string;
  sexo?: string;
  tipo_consulta?: string;
  especialidad?: string;
  codigo_cie_10?: string;
  q?: string;
  limit?: number;
}

// ── Estadísticas ──

export interface Sigsa3EspecialidadItem {
  especialidad?: string | null;
  tipo_consulta?: string | null;
  sexo?: string | null;
  total: number;
}

export interface Sigsa3EspecialidadResponse {
  titulo: string;
  desde: string;
  hasta: string;
  datos: Sigsa3EspecialidadItem[];
  total_general: number;
  generado_en: string;
}

export interface Sigsa3DxItem {
  especialidad: string | null;
  tipo_consulta: string | null;
  dx: string | null;
  total_m: number;
  total_f: number;
  total: number;
}

export interface Sigsa3DxTotalGrupoItem {
  especialidad?: string | null;
  tipo_consulta?: string | null;
  sexo?: string | null;
  total: number;
}

export interface Sigsa3DxFrecuentesResponse {
  titulo: string;
  desde: string;
  hasta: string;
  top: number;
  datos: Sigsa3DxItem[];
  totales_por_grupo: Sigsa3DxTotalGrupoItem[];
  total_general: number;
  generado_en: string;
}

// ── Diagnósticos CIE-10 Z ──

export interface Sigsa3DxZItem {
  tipo_consulta: string;
  codigo_cie_10: string;
  total: number;
  pacientes: number;
}

export interface Sigsa3DxZResponse {
  titulo: string;
  desde: string;
  hasta: string;
  codigos_filtrados: string[];
  datos: Sigsa3DxZItem[];
  total_general: number;
  total_pacientes: number;
  generado_en: string;
}

// ── Personal Salud ──

export interface PersonalSalud {
  id: number;
  nombre: string;
  especialidad?: string;
  activo?: boolean;
}

export interface PersonalSaludCreate {
  nombre: string;
  especialidad?: string;
  activo?: boolean;
}

export interface PersonalSaludUpdate {
  nombre?: string;
  especialidad?: string;
  activo?: boolean;
}
