

export interface ConstanciaNacimientoOut {
  documento: string;
  paciente_id: number;
  medico_id: number;
  registrador_id: number;
  nombre_madre: string;
  vecindad_madre: string;
  fecha_registro: string;
  menor_edad: Record<string, unknown>;
  hijos: number;
  vivos: number;
  muertos: number;
  observaciones: string;
  metadatos: Record<string, unknown>;
  id: number;
  created_at: string;
  updated_at: string;
}



export interface ConstanciaNacimientoCreate {
  documento: string;
  paciente_id: number;
  medico_id: number;
  registrador_id: number;
  nombre_madre: string;
  vecindad_madre: string;
  fecha_registro: string;
  menor_edad: Record<string, unknown>;
  hijos: number;
  vivos: number;
  muertos: number;
  observaciones: string;
  metadatos: Record<string, unknown>;
}


export interface ConstanciaNacHistorial {
  id: number;
  constancia_id: number;
  datos_anteriores: Record<string, unknown>;
  usuario_id: number;
  motivo: string;
  fecha: string;
}



export interface ConstanciaNacimientoUpdate {
  nombre_madre?: string;
  vecindad_madre?: string;
  menor_edad?: Record<string, unknown>;
  hijos?: number;
  vivos?: number;
  muertos?: number;
  observaciones?: string;
  metadatos?: Record<string, unknown>;
  motivo: string;
}
