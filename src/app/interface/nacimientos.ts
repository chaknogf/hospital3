export interface NacimientoBase {
  paciente_id?: number | null;
  madre_id?: number | null;
  expediente?: string | null;
  nombre_completo?: string | null;
  sexo?: string | null;
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
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  tipo_parto?: string | null;
  clase_parto?: string | null;
  gemelo?: string | null;
  hora_nacimiento?: string | null;
  extrahospitalario?: boolean | null;
}

export interface NacimientoOut extends NacimientoBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface NacimientoListResponse {
  total: number;
  nacimientos: NacimientoOut[];
}
