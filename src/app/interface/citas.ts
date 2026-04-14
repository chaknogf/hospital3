import { PacienteJoin } from "./interfaces";



export interface CitaCreate {
  id?: number;
  fecha: string;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  agenda: string;
  datos_extra: any;
  created_by: string;
}

export interface CitaResponse extends CitaCreate {
  id: number
  paciente: PacienteJoin;
}
