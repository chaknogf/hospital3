// app/models/consultas.interface.ts

import { Paciente } from "./interfaces";

// ===================================================================
// TIPO DE ESTADOS DEL CICLO CLÍNICO
// ===================================================================
export type EstadoCiclo =
  | "iniciado"      // Estado inicial legacy
  | "pendiente"     // Estado inicial
  | "admision"      // Paciente admitido
  | "signos"        // Toma de signos vitales
  | "consulta"      // En consulta con el médico
  | "estudios"      // Realizando estudios/laboratorios
  | "tratamiento"   // Recibiendo tratamiento
  | "observacion"   // En observación
  | "evolucion"     // Seguimiento/evolución
  | "procedimiento" // Realizando procedimiento
  | "recuperacion"  // En recuperación
  | "egreso"        // Alta médica
  | "referido"      // Referido a otra institución
  | "traslado"      // Trasladado a otro servicio
  | "prestamo"      // Expediente prestado
  | "archivo"       // Archivado
  | "recepcion"     // En recepción
  | "actualizado"   // Registro actualizado
  | "reprogramado"  // Consulta reprogramada
  | "descartado";   // Consulta descartada/cancelada


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
  estudiante_publico: boolean;
  empleado_publico: boolean;
  accidente_laboral: boolean;
  discapacidad: boolean;
  accidente_transito: boolean;
  arma_fuego: boolean;
  arma_blanca: boolean;
  ambulancia: boolean;
  embarazo: boolean;
}

// ===================================================================
// CICLO CLÍNICO (UN REGISTRO EN EL HISTORIAL)
// ===================================================================
export interface CicloClinico {
  // ✅ Campos obligatorios de auditoría
  estado: EstadoCiclo;
  registro?: string;  // ISO timestamp
  usuario?: string;

  // ✅ Campos clínicos opcionales
  especialidad?: string;
  servicio?: string;
  detalle_clinicos?: { [key: string]: Datos };
  signos_vitales?: SignosVitales | { [key: string]: SignosVitales };
  antecedentes?: Antecedentes | { [key: string]: Antecedentes };
  ordenes?: { [key: string]: Datos };
  estudios?: { [key: string]: Datos };
  comentario?: string | { [key: string]: Nota };  // ✅ Acepta string O dict
  impresion_clinica?: { [key: string]: Nota };
  tratamiento?: { [key: string]: Nota };
  examen_fisico?: ExamenFisico | { [key: string]: ExamenFisico };
  nota_enfermeria?: { [key: string]: Enfermeria };
  contraindicado?: string;
  presa_quirurgica?: PresaQuirurgica | { [key: string]: PresaQuirurgica };
  egreso?: Egreso | { [key: string]: Egreso };
}

export type CicloPatch = Omit<
  CicloClinico,
  'usuario' | 'registro'
>;

// ✅ Alias para compatibilidad con código legacy
export type Ciclo = CicloClinico;

export interface ConsultaBase {
  expediente?: string;
  paciente_id?: number;  // ✅ Opcional en base
  tipo_consulta?: number;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  fecha_consulta?: string;
  hora_consulta?: string;
  indicadores?: Indicador;
  ciclo: CicloClinico[];
  orden?: number;
}

export interface ConsultaCreate {
  // Campos obligatorios
  paciente_id: number;      // ✅ Obligatorio aquí
  tipo_consulta: number;    // ✅ Obligatorio aquí
  fecha_consulta: string;   // ✅ Obligatorio aquí
  hora_consulta: string;    // ✅ Obligatorio aquí
  // Campos opcionales
  expediente?: string;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  indicadores?: Indicador;
  ciclo?: CicloClinico[];
  orden?: number;
}

export interface RegistroConsultaCreate {
  paciente_id: number;
  tipo_consulta: number;
  especialidad: string;
  servicio: string;
  indicadores: Indicador;
  ciclo: CicloClinico[];  // ✅ Array con el primer registro
}

// ✅ Para REGISTRAR una nueva consulta (todos obligatorios)

export interface RegistroConsultaResponse {
  id: number;
  expediente: string;
  paciente_id: number;
  tipo_consulta: number;
  especialidad: string;
  servicio: string;
  documento: string;
  fecha_consulta: string;
  hora_consulta: string;
  indicadores: Indicador;
  ciclo: CicloClinico[];  // ✅ Array con el primer registro
  orden: number;
}

// ✅ Para ACTUALIZAR consultas (todo opcional excepto id)
export interface ConsultaUpdate {
  expediente?: string;
  tipo_consulta?: number;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  fecha_consulta?: string;
  hora_consulta?: string;
  indicadores?: Indicador;
  ciclo?: CicloClinico;  // ✅ Solo un ciclo para actualizar
  orden?: number;
}


// ✅ ConsultaOut NO incluye created_at/updated_at
export interface ConsultaOut extends ConsultaBase {
  id: number;
  paciente: Paciente;


}
// Para respuestas de listas con paginación
export interface ConsultaListResponse {
  total: number;
  consultas: ConsultaOut[];
}

// Respuesta detallada con datos del paciente (si la usas)
export interface ConsultaResponse extends ConsultaBase {
  id: number;
  paciente: Paciente;
}

// ===================================================================
// TOTALES Y ESTADÍSTICAS
// ===================================================================
export interface TotalesItem {
  entidad: string;    // Nombre del indicador
  total: number;      // Cantidad
  icono?: string;     // Icono para UI
  color?: string;     // Color del card
}

export interface TotalesResponse {
  totales: TotalesItem[];
  generado_en: string;  // Timestamp ISO
}

export type Totales = TotalesItem;  // Alias para compatibilidad


// ===================================================================
// ENUM DE CAMPOS CLÍNICOS (PARA REFERENCIAS)
// ===================================================================
export enum CamposClinicos {
  CICLO = 'ciclo',
  INDICADORES = 'indicadores',
  DETALLE_CLINICOS = 'detalle_clinicos',
  SIGNOS_VITALES = 'signos_vitales',
  ANTECEDENTES = 'antecedentes',
  ORDENES = 'ordenes',
  ESTUDIOS = 'estudios',
  COMENTARIO = 'comentario',
  IMPRESION_CLINICA = 'impresion_clinica',
  TRATAMIENTO = 'tratamiento',
  EXAMEN_FISICO = 'examen_fisico',
  NOTA_ENFERMERIA = 'nota_enfermeria',
  CONTRAINDICADO = 'contraindicado',
  PRESA_QUIRURGICA = 'presa_quirurgica',
  EGRESO = 'egreso'
}


// ===================================================================
// TIPOS DE CONSULTA
// ===================================================================
export enum TipoConsulta {
  COEX = 1,
  HOSPITALIZACION = 2,
  EMERGENCIA = 3
}


// ===================================================================
// HELPERS / UTILIDADES
// ===================================================================

/**
 * Obtiene el último estado del ciclo clínico
 */
export function obtenerEstadoActual(consulta: ConsultaOut): EstadoCiclo | null {
  if (!consulta.ciclo || consulta.ciclo.length === 0) {
    return null;
  }
  return consulta.ciclo[consulta.ciclo.length - 1].estado;
}

/**
 * Obtiene el historial completo ordenado cronológicamente
 */
export function obtenerHistorialCiclo(consulta: ConsultaOut): CicloClinico[] {
  return consulta.ciclo || [];
}

/**
 * Filtra ciclos por estado
 */
export function filtrarCiclosPorEstado(
  consulta: ConsultaOut,
  estado: EstadoCiclo
): CicloClinico[] {
  return (consulta.ciclo || []).filter(c => c.estado === estado);
}

/**
 * Verifica si la consulta está en un estado específico
 */
export function estaEnEstado(consulta: ConsultaOut, estado: EstadoCiclo): boolean {
  return obtenerEstadoActual(consulta) === estado;
}

/**
 * Obtiene el último registro del ciclo
 */
export function obtenerUltimoCiclo(consulta: ConsultaOut): CicloClinico | null {
  if (!consulta.ciclo || consulta.ciclo.length === 0) {
    return null;
  }
  return consulta.ciclo[consulta.ciclo.length - 1];
}

/**
 * Crea un indicador vacío con todos los campos en false
 */
export function crearIndicadorVacio(): Indicador {
  return {
    estudiante_publico: false,
    empleado_publico: false,
    accidente_laboral: false,
    discapacidad: false,
    accidente_transito: false,
    arma_fuego: false,
    arma_blanca: false,
    ambulancia: false,
    embarazo: false
  };
}

/**
 * Crea un nuevo registro de ciclo clínico
 */
export function crearRegistroCiclo(
  estado: EstadoCiclo,
  usuario: string,
  datos?: Partial<CicloClinico>
): CicloClinico {
  return {
    estado,
    registro: new Date().toISOString(),
    usuario,
    ...datos
  };
}

/**
 * Obtiene los signos vitales del último ciclo
 */
export function obtenerSignosVitalesActuales(consulta: ConsultaOut): SignosVitales | null {
  const ultimo = obtenerUltimoCiclo(consulta);
  if (!ultimo || !ultimo.signos_vitales) {
    return null;
  }

  // Si signos_vitales es un objeto directo, retornarlo
  if ('pa' in ultimo.signos_vitales || 'fc' in ultimo.signos_vitales) {
    return ultimo.signos_vitales as SignosVitales;
  }

  // Si es un diccionario con timestamps, obtener el más reciente
  const keys = Object.keys(ultimo.signos_vitales);
  if (keys.length > 0) {
    const ultimoKey = keys[keys.length - 1];
    return ultimo.signos_vitales[ultimoKey];
  }

  return null;
}

/**
 * Cuenta los registros de ciclo por estado
 */
export function contarPorEstado(consulta: ConsultaOut): Record<EstadoCiclo, number> {
  const conteo = {} as Record<EstadoCiclo, number>;

  (consulta.ciclo || []).forEach(c => {
    conteo[c.estado] = (conteo[c.estado] || 0) + 1;
  });

  return conteo;
}
