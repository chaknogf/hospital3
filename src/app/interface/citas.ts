import { PacienteJoin } from "./interfaces";

export interface DatosExtras {
  razon_consulta: string;
  nota: string;
  cita_laboratorio: string;

}

export interface CitaCreate {
  expediente: string;
  paciente_id: number;
  especialidad: string;
  fecha_cita: string;
  datos_extra: DatosExtras;
}

export interface CitasBase {
  fecha_registro: string;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  fecha_cita: string;
  datos_extra: DatosExtras;

}

export interface Citas {
  id: number;
  fecha_registro: string;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  fecha_cita: string;
  datos_extra: DatosExtras;
  created_by: string
  paciente: PacienteJoin;

}

export interface CitaUpdate {
  id?: number;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  fecha_cita: string;
  datos_extra: any;

}

export interface CitaResponse extends Citas {
  id: number;
  paciente: PacienteJoin;
}

export interface ConteoCitas {
  fecha_cita: string;
  razon_consulta?: string;
  total: number;
}
