import { ConsultaPacienteResumen } from './consultas'

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

export interface Antecedentes {
  familiares: any[];
  medicos: any[];
  quirurgicos: any[];
  alergicos: any[];
  traumaticos: any[];
  ginecoobstetricos: any[];
  habitos: any[];
}

export interface Nota {
  usuario: string;
  nota: string;
  registro: string;
}

export interface Enfermeria {
  usuario: string;
  turno: string;
  nota: string;
  registro: string;
  signos: { [key: string]: SignosVitales };
}

export interface Silverman {
  retraso_esternal: number;
  aleteo_nasal: number;
  quejido_expiratorio: number;
  movimiento_toracico: number;
  retraccion_supraclavicular: number;
  puntuacion_total: number;
}

export interface Downe {
  frecuencia_respiratoria: number;
  aleteo_nasal: number;
  quejido_respiratorio: number;
  retraccion_toracoabdominal: number;
  cinoasis: number;
  puntuacion_total: number;
}

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

export interface Glasgow {
  apertura_ocular: number;
  respuesta_verbal: number;
  respuesta_motora: number;
  puntuacion_total: number;
}

export interface Bishop {
  dilatacion: number;
  borramiento: number;
  posicion: number;
  consistencia: number;
  altura_presentacion: number;
  puntuacion_total: number;
}

export interface Apgar {
  tono_muscular: number;
  respuesta_refleja: number;
  llanto: number;
  respiracion: number;
  coloracion: number;
  puntuacion_total: number;
  interpretacion: string;
}

export interface ExamenFisico {
  silverman: { [key: string]: Silverman };
  downe: { [key: string]: Downe };
  cuerpo: { [key: string]: Cuerpo };
  glasgow: { [key: string]: Glasgow };
  bishop: { [key: string]: Bishop };
  apgar: { [key: string]: Apgar };
}

export interface Sistema {
  usuario: string;
  accion: string;
  fecha: string;
}

export interface Dx {
  codigo: string;
  descripcion: string;
}


export interface Egreso {
  registro?: string;
  condicion: string;
  referencia?: string;
  diagnosticos?: Dx[];         // Lista de diagnósticos al egreso
  medico?: string;
}

export interface PresaQuirurgica {
  programada: string;
  reprogramada: string;
  realizada: string;
  detalle: string;
  especialidad: string;
}

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
}

export interface CicloConsulta {
  id?: number;
  consulta_id: number;
  numero: number;
  activo: boolean;
  registro: string;
  usuario: string;
  especialidad?: string;
  servicio?: string;
  contenido?: string;
  datos_medicos?: DatoMedico;
  consulta?: ConsultaPacienteResumen;
  total?: number;
}



