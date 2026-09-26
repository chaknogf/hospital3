import { PacienteJoin } from "./interfaces";

/** Motivo y notas adicionales conservadas dentro de una cita. */
export interface DatosExtras {
  razon_consulta: string;
  nota: string;
  cita_laboratorio: string;

}

/** Datos requeridos para agendar una cita. */
export interface CitaCreate {
  expediente: string;
  paciente_id: number;
  especialidad: string;
  personal_atencion_id?: number | null;
  fecha_cita: string;
  datos_extra: DatosExtras;
}

/** Campos compartidos por una cita antes de añadir sus metadatos de salida. */
export interface CitasBase {
  fecha_registro: string;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  personal_atencion_id?: number | null;
  fecha_cita: string;
  datos_extra: DatosExtras;

}

/** Cita persistida con datos de paciente y personal relacionados. */
export interface Citas {
  id: number;
  fecha_registro: string;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  personal_atencion_id?: number | null;
  personal_atencion_nombre?: string | null;
  fecha_cita: string;
  razon_consulta?: string;
  notas?: string;
  datos_extra: DatosExtras;
  created_by: string
  paciente: PacienteJoin;

}

/** Respuesta de citas con total para paginación. */
export interface CitaListResponse {
  total: number;
  citas: Citas[];
}

/** Campos enviados al actualizar o reagendar una cita. */
export interface CitaUpdate {
  id?: number;
  expediente: string;
  paciente_id: number;
  especialidad: string;
  personal_atencion_id?: number | null;
  fecha_cita: string;
  datos_extra: any;

}

/** Respuesta de detalle de cita con paciente relacionado. */
export interface CitaResponse extends Citas {
  id: number;
  paciente: PacienteJoin;
}

/** Conteo de citas agrupado por fecha y motivo. */
export interface ConteoCitas {
  fecha_cita: string;
  dia_semana: string;
  razon_consulta?: string;
  total: number;
}

/** Día no laborable que puede bloquear la programación de citas. */
export interface DiaInhabil {
  id: number;
  fecha: string;
  motivo?: string | null;
  activo: boolean;
  created_by?: string | null;
}
