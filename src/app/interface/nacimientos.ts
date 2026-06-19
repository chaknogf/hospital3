export interface NacimientoBase {
  paciente_id?: number | null;
  madre_id?: number | null;
  expediente?: string | null;
  nombre_completo?: string | null;
  sexo?: string | null;
  estado?: string | null;
  fecha_nacimiento?: string | null;
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  tipo_parto?: string | null;
  clase_parto?: string | null;
  gemelo?: string | null;
  hora_nacimiento?: string | null;
  extrahospitalario?: boolean;
  registrador_id?: number | null;
  datos_extra?: Record<string, unknown>;
}

export interface NacimientoCreate extends NacimientoBase {}

export interface NacimientoUpdate {
  madre_id?: number | null;
}

export interface NeonatalesPayload {
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  tipo_parto?: string | null;
  clase_parto?: string | null;
  gemelo?: string | null;
  hora_nacimiento?: string | null;
  extrahospitalario?: boolean;
}

export interface PacienteResumen {
  id: number;
  expediente?: string | null;
  nombre_completo?: string | null;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  estado?: string | null;
}

export interface NacimientoOut extends NacimientoBase {
  id: number;
  created_at: string;
  updated_at: string;
  neonatales?: NeonatalesPayload | null;
  paciente?: PacienteResumen | null;
  peso_gramos?: number | null;
  clasificacion_nacimiento?: string | null;
  trabajo_parto?: string | null;
  nombre_madre?: string | null;
}

export interface NacimientoListResponse {
  total: number;
  nacimientos: NacimientoOut[];
}
