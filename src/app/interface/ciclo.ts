import { ConsultaPacienteResumen } from './consultas';
import { DatosUisau } from '../uisau/uisau.model';

/** Signos vitales registrados en una valoración clínica o de enfermería. */
export interface SignosVitales {
  pa: string;
  fc: string;
  fr: string;
  sat02: string;
  temp: string;
  peso: string;
  talla: string;
  pt: string;
  te: string;
  pe: string;
  gmt: string;
}

/** Grupos de antecedentes médicos capturados en la historia clínica. */
export interface Antecedentes {
  familiares: any[];
  medicos: any[];
  quirurgicos: any[];
  alergicos: any[];
  traumaticos: any[];
  ginecoobstetricos: any[];
  habitos: any[];
}

/** Nota clínica con autor y fecha de registro. */
export interface Nota {
  usuario: string;
  nota: string;
  registro: string;
}

/** Nota de enfermería por turno, con signos registrados. */
export interface Enfermeria {
  usuario: string;
  turno: string;
  nota: string;
  registro: string;
  signos: { [key: string]: SignosVitales };
}

/** Puntuación clínica de dificultad respiratoria neonatal de Silverman. */
export interface Silverman {
  retraso_esternal: number;
  aleteo_nasal: number;
  quejido_expiratorio: number;
  movimiento_toracico: number;
  retraccion_supraclavicular: number;
  puntuacion_total: number;
}

/** Puntuación de dificultad respiratoria neonatal según escala de Downe. */
export interface Downe {
  frecuencia_respiratoria: number;
  aleteo_nasal: number;
  quejido_respiratorio: number;
  retraccion_toracoabdominal: number;
  cinoasis: number;
  puntuacion_total: number;
}

/** Hallazgos organizados por región anatómica durante el examen físico. */
export interface Cuerpo {
  cabeza: string;
  ojos: string;
  oidos: string;
  nariz: string;
  boca: string;
  cuello: string;
  torax: string;
  pulmones: string;
  corazon: string;
  abdomen: string;
  genitales: string;
  extremidades: string;
  columna: string;
  piel: string;
  neurologico: string;
}

/** Componentes y total de la escala neurológica de Glasgow. */
export interface Glasgow {
  apertura_ocular: number;
  respuesta_verbal: number;
  respuesta_motora: number;
  puntuacion_total: number;
}

/** Componentes y total de la escala obstétrica de Bishop. */
export interface Bishop {
  dilatacion: number;
  borramiento: number;
  posicion: number;
  consistencia: number;
  altura_presentacion: number;
  puntuacion_total: number;
}

/** Componentes, puntuación e interpretación de la escala Apgar. */
export interface Apgar {
  tono_muscular: number;
  respuesta_refleja: number;
  llanto: number;
  respiracion: number;
  coloracion: number;
  puntuacion_total: number;
  interpretacion: string;
}

/** Evaluaciones físicas agrupadas por escala o sección del examen. */
export interface ExamenFisico {
  silverman: { [key: string]: Silverman };
  downe: { [key: string]: Downe };
  cuerpo: { [key: string]: Cuerpo };
  glasgow: { [key: string]: Glasgow };
  bishop: { [key: string]: Bishop };
  apgar: { [key: string]: Apgar };
}

/** Evento de auditoría del sistema asociado a una acción clínica. */
export interface Sistema {
  usuario: string;
  accion: string;
  fecha: string;
}

/** Diagnóstico clínico con código y descripción. */
export interface Dx {
  codigo: string;
  descripcion: string;
}

/** Condición clínica, referencia y diagnósticos asociados al egreso. */
export interface Egreso {
  registro?: string;
  condicion: string;
  referencia?: string;
  diagnosticos?: Dx[];
  medico?: string;
}

/** Estado de programación quirúrgica incorporado a la nota médica. */
export interface PresaQuirurgica {
  programada: string;
  reprogramada: string;
  realizada: string;
  detalle: string;
  especialidad: string;
}

/** Datos actuales de una intervención, resueltos desde el ID almacenado en JSONB. */
export interface DatosQuirurgicos {
  intervencion_id?: number;
  paciente_id?: number;
  consulta_id?: number | null;
  paciente_nombre?: string | null;
  fecha?: string | null;
  expediente?: string | null;
  personal_atencion_id?: number | null;
  personal_atencion_nombre?: string | null;
  procedimiento_principal?: string | null;
  procedimiento_principal_id?: number | null;
  procedimiento_2?: string | null;
  procedimiento_2_id?: number | null;
  procedimiento_2_catalogo_nombre?: string | null;
  procedimiento_3?: string | null;
  procedimiento_3_id?: number | null;
  procedimiento_3_catalogo_nombre?: string | null;
  procedimiento_4?: string | null;
  procedimiento_4_id?: number | null;
  procedimiento_4_catalogo_nombre?: string | null;
  procedimiento_5?: string | null;
  procedimiento_5_id?: number | null;
  procedimiento_5_catalogo_nombre?: string | null;
  procedimiento_principal_catalogo_nombre?: string | null;
  area_cuerpo_intervenida?: string | null;
  area_cuerpo_intervenida_nombre?: string | null;
  id_area_cuerpo_intervenida?: number | null;
  estado_cirugia_id?: number | null;
  estado_cirugia_nombre?: string | null;
  formato_procedimiento_id?: number | null;
  formato_procedimiento_nombre?: string | null;
  procedencia_procedimiento_id?: number | null;
  procedencia_procedimiento_nombre?: string | null;
  rango_especialista_id?: number | null;
  rango_especialista_nombre?: string | null;
  especialidad_id?: number | null;
  quirofano_numero_id?: number | null;
  quirofano_numero_nombre?: string | null;
  especialidad_nombre?: string | null;
  hora_inicio_anestesia?: string | null;
  hora_inicio_intervencion?: string | null;
  hora_finaliza_intervencion?: string | null;
  hora_finaliza_limpieza_prepara_quirofano?: string | null;
  observaciones?: string | null;
  datos_extra?: Record<string, unknown> | null;
  activo?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Secciones clínicas opcionales guardadas en un ciclo de atención. */
export interface DatoMedico {
  detalle_clinicos?: string;
  signos_vitales?: SignosVitales;
  antecedentes?: Antecedentes;
  ordenes?: string;
  estudios?: string;
  comentario?: string;
  impresion_clinica?: string;
  tratamiento?: string;
  examen_fisico?: ExamenFisico;
  contraindicado?: string;
  presa_quirurgica?: PresaQuirurgica;
  egreso?: Egreso;
  odontologia?: import('../medica/notaMedica/odontograma.model').NotaOdontologica;
}

/** Registro secuencial de atención que compone el historial de una consulta. */
export interface CicloConsulta {
  id?: number;
  consulta_id: number;
  numero: number;
  activo: boolean;
  registro: string;
  usuario: string;
  usuario_nombre?: string;
  especialidad?: string;
  especialidad_id?: number;
  servicio?: string;
  contenido?: string;
  datos_medicos?: DatoMedico;
  uisau?: DatosUisau;
  quirofano?: DatosQuirurgicos;
  consulta?: ConsultaPacienteResumen;
  total?: number;
}

// ===================================================================
// Historia clínica agrupada por consulta
// ===================================================================
/** Proyección resumida de un ciclo para presentar la historia clínica. */
export interface CicloResumen {
  id: number;
  numero: number;
  registro: string;
  usuario: string;
  usuario_nombre?: string;
  especialidad?: string;
  servicio?: string;
  resumen?: string;
  signos_vitales?: Record<string, string>;
  impresion_clinica?: string;
  egreso?: { condicion?: string; referencia?: string; medico?: string; diagnosticos?: any[] };
  odontologia?: {
    motivo_consulta?: string;
    diagnostico?: string;
    plan_tratamiento?: string;
    procedimientos?: string;
    piezas_afectadas?: string[];
  };
  uisau?: DatosUisau;
  quirofano?: DatosQuirurgicos;
}

/** Consulta agrupada con sus ciclos clínicos ordenados. */
export interface ConsultaHistoria {
  consulta: {
    id: number;
    tipo_consulta?: number;
    especialidad?: string;
    servicio?: string;
    fecha_consulta?: string;
    hora_consulta?: string;
    ultimo_estado?: string;
  };
  ciclos: CicloResumen[];
  total_ciclos: number;
}

/** Historia clínica agrupada por consulta para un paciente. */
export interface HistoriaClinicaResponse {
  paciente_id: number;
  paciente_nombre?: string;
  paciente_expediente?: string;
  consultas: ConsultaHistoria[];
  total_consultas: number;
  total_ciclos: number;
}
