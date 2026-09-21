export interface FormatoProcedimiento {
  formato_procedimiento_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface EstadoCirugia {
  estado_cirugia_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface RangoEspecialista {
  rango_especialista_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface ProcedenciaProcedimiento {
  procedencia_procedimiento_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Especialidad {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  codigo?: string | null;
  estado: boolean;
  sop: boolean;
}

export interface ProcedimientoQuirofano {
  procedimiento_quirofano_id: number;
  codigo: string;
  nombre: string;
  especialidad_id: number | null;
  especialidad_nombre?: string | null;
  activo: boolean;
}

export interface QuirofanoNumero {
  quirofano_numero_id: number;
  numero: number;
  nombre: string;
  activo: boolean;
}

export interface IntervencionQuirurgica {
  intervencion_id: number;
  paciente_id: number;
  paciente_nombre?: string;
  expediente?: string;
  personal_atencion_id?: number;
  personal_atencion_nombre?: string;
  quirofano_numero_id?: number;
  quirofano_numero_nombre?: string;
  procedimiento_principal?: string;
  procedimiento_2?: string;
  procedimiento_3?: string;
  procedimiento_4?: string;
  procedimiento_5?: string;
  area_cuerpo_intervenida?: string;
  estado_cirugia_id?: number;
  estado_cirugia_nombre?: string;
  formato_procedimiento_id?: number;
  formato_procedimiento_nombre?: string;
  procedencia_procedimiento_id?: number;
  procedencia_procedimiento_nombre?: string;
  rango_especialista_id?: number;
  rango_especialista_nombre?: string;
  fecha: string;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IntervencionCreate {
  paciente_id: number;
  expediente?: string;
  personal_atencion_id?: number;
  quirofano_numero_id?: number;
  estado_cirugia_id?: number;
  formato_procedimiento_id?: number;
  procedencia_procedimiento_id?: number;
  rango_especialista_id?: number;
  procedimiento_principal?: string;
  procedimiento_2?: string;
  procedimiento_3?: string;
  procedimiento_4?: string;
  procedimiento_5?: string;
  area_cuerpo_intervenida?: string;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
}

export interface IntervencionUpdate {
  personal_atencion_id?: number;
  quirofano_numero_id?: number;
  estado_cirugia_id?: number;
  formato_procedimiento_id?: number;
  procedencia_procedimiento_id?: number;
  rango_especialista_id?: number;
  procedimiento_principal?: string;
  procedimiento_2?: string;
  procedimiento_3?: string;
  procedimiento_4?: string;
  procedimiento_5?: string;
  area_cuerpo_intervenida?: string;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface IntervencionListResponse {
  total: number;
  intervenciones: IntervencionQuirurgica[];
}