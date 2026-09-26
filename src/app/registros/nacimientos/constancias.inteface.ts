import { Paciente } from "../../interface/interfaces";
import { Medico } from "../../interface/medicos.interface";

/** Datos de la constancia de nacimiento y sus relaciones de paciente y personal. */
export interface ConstanciaNacimiento {
  id: number;
  documento?: string;
  paciente_id: number;
  madre_id?: number;
  personal_atencion_id?: number;
  registrador_id?: number;
  nombre_madre?: string;
  vecindad_madre?: string;
  fecha_registro?: string;
  menor_edad?: Record<string, unknown>;
  hijos?: number;
  vivos?: number;
  muertos?: number;
  observaciones?: string;
  metadatos?: Record<string, unknown>;
  estado_informe?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: Paciente;
  madre?: Paciente;
  medico?: Medico;
}

/** Respuesta paginada de constancias de nacimiento. */
export interface InformeNacimientoListResponse {
  total: number;
  constancias: ConstanciaNacimiento[];
}

/** Constancia de nacimiento enriquecida con el expediente del paciente. */
export interface InformeNacimiento extends ConstanciaNacimiento {
  id: number;
  expediente?: string;
}
