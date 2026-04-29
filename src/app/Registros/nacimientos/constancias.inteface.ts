import { Paciente } from "../../interface/interfaces";
import { Medico } from "../../interface/medicos.interface";

export interface ConstanciaNacimiento {
  id: number;
  documento?: string;
  paciente_id: number;
  madre_id?: number;
  medico_id?: number;
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
  created_at?: string;
  updated_at?: string;
  paciente?: Paciente;
  madre?: Paciente;
  medico?: Medico;
}
