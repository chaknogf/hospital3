import { servicios } from './../enum/consultas';

// app/models/consultas.interface.ts

export interface Datos {
  ciclo: string;
  registro: string;
}

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
  tipo: string;
}

export interface Egreso {
  registro: string;
  usuario: string;
  referencia: string;
  diagnostico: Dx[];
  condicion_egreso: string;
}

export interface PresaQuirurgica {
  programada: string;
  reprogramada: string;
  realizada: string;
  detalle: string;
  especialidad: string;
}

export interface Indicador {
  estudiante_publico: boolean
  empleado_publico: boolean
  accidente_laboral: boolean
  discapacidad: boolean
  accidente_transito: boolean
  arma_fuego: boolean
  arma_blanca: boolean
  ambulancia: boolean
  embarazo: boolean
}

export interface Ciclo {
  estado: string;
  registro: string;
  usuario: string;
  especialidad?: string;
  servicio: string;
  detalle_clinico?: { [key: string]: Datos };
  sistema?: { [key: string]: Sistema };
  signos_vitales?: { [key: string]: SignosVitales };
  antecedentes?: { [key: string]: Antecedentes };
  ordenes?: { [key: string]: Datos };
  estudios?: { [key: string]: Datos };
  comentario?: { [key: string]: Nota };
  impresion_clinica?: { [key: string]: Nota };
  tratamiento?: { [key: string]: Nota };
  examen_fisico?: { [key: string]: ExamenFisico };
  nota_enfermeria?: { [key: string]: Enfermeria };
  contraindicado?: string;
  presa_quirurgica?: { [key: string]: PresaQuirurgica };
  egreso?: { [key: string]: Egreso };
}

export interface ConsultaBase {
  id: number;
  expediente?: string;
  paciente_id: number;
  tipo_consulta?: number;
  especialidad?: number;
  servicio?: number;
  documento?: string;
  fecha_consulta?: string; // ISO string
  hora_consulta?: string; // HH:MM
  indicadores?: Indicador;
  ciclo?: { [key: string]: Ciclo };
}

export interface ConsultaCreate extends ConsultaBase { }
export interface ConsultaUpdate extends ConsultaBase {
  id: number;
}
export interface ConsultaOut extends ConsultaBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultaResponse {
  id_paciente: number;
  expediente: string;
  cui: number;
  pasaporte: string;
  nombre: {
    primer_nombre: string;
    segundo_nombre: string;
    otro_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    apellido_casada: string;
  };
  sexo: string;
  fecha_nacimiento: string; // ISO date string
  estado: string;
  id_consulta: number;
  tipo_consulta: number;
  especialidad: number;
  servicio: number;
  documento: string;
  fecha_consulta: string; // ISO date string
  hora_consulta: string; // ISO time string
  ciclo: Record<string, any>;
}
