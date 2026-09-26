/** Relación básica del nacimiento con el paciente y, opcionalmente, su madre. */
export interface NacimientoBase {
  paciente_id?: number | null;
  madre_id?: number | null;
}

/** Campos aceptados al registrar un nacimiento. */
export interface NacimientoCreate extends NacimientoBase {
  mortinato?: boolean | null;
}

/** Campos modificables de un nacimiento ya registrado. */
export interface NacimientoUpdate {
  madre_id?: number | null;
  mortinato?: boolean | null;
}

/** Atributos neonatales opcionales asociados al nacimiento. */
export interface NeonatalesPayload {
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  tipo_parto?: string | null;
  clase_parto?: string | null;
  gemelo?: string | null;
  hora_nacimiento?: string | null;
  extrahospitalario?: boolean;
}

/** Identidad resumida del recién nacido relacionada con el registro. */
export interface PacienteResumen {
  id: number;
  expediente?: string | null;
  cui?: string | null;
  nombre_completo?: string | null;
  nombre?: Record<string, string | null> | null;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  estado?: string | null;
}

/** Representación de salida de un nacimiento con sus relaciones disponibles. */
export interface NacimientoOut {
  id: number;
  paciente_id?: number | null;
  madre_id?: number | null;
  registrador_id?: number | null;
  created_at: string;
  updated_at: string;
  mortinato: boolean;
  peso_gramos?: number | null;
  clasificacion_nacimiento?: string | null;
  trabajo_parto?: string | null;
  id_legacy?: number | null;
  neonatales?: NeonatalesPayload | null;
  paciente?: PacienteResumen | null;
  nombre_madre?: string | null;
}

/** Respuesta de listado de nacimientos con total para paginación. */
export interface NacimientoListResponse {
  total: number;
  nacimientos: NacimientoOut[];
}

/** Modelo plano que adapta el formulario a los payloads de nacimiento. */
export interface NacimientoFormModel {
  paciente_id: number | null;
  madre_id: number | null;
  expediente: string | null;
  nombre_completo: string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  peso_nacimiento: string | null;
  edad_gestacional: string | null;
  tipo_parto: string | null;
  clase_parto: string | null;
  gemelo: string | null;
  hora_nacimiento: string | null;
  extrahospitalario: boolean;
  mortinato: boolean;
  registrador_id: number | null;
  datos_extra: Record<string, unknown> | undefined;
}

export interface NacimientoListResponse {
  total: number;
  nacimientos: NacimientoOut[];
}
