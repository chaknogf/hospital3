// app/models/consultas.interface.ts
import { Paciente } from "./interfaces";
import { PacienteJoin } from './interfaces';

// ===================================================================
// TIPO DE ESTADOS DEL CICLO CLÍNICO
// ===================================================================
/** Estados admitidos para el recorrido asistencial de una consulta. */
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
  | "descartado"   // Consulta descartada/cancelada
  | "borrado"   // Consulta descartada/cancelada
  | "triage"; // Consulta contraindicada


/** Datos de programación y ejecución de una intervención quirúrgica. */
export interface PresaQuirurgica {
  programada: string;
  reprogramada: string;
  realizada: string;
  detalle: string;
  especialidad: string;
}
/** Registro con referencia al ciclo y fecha de persistencia. */
export interface Datos {
  ciclo: string;
  registro: string;
}



/** Código diagnóstico y su descripción legible. */
export interface Dx {
  codigo: string;
  descripcion: string;
}


/** Condición y datos clínicos registrados al egresar al paciente. */
export interface Egreso {
  registro?: string;
  condicion: string;
  referencia?: string;
  lactancia_materna?: boolean | null;
  diagnosticos?: string;         // Lista de diagnósticos al egreso
  medico?: string;

}



/** Indicadores epidemiológicos capturados al registrar una consulta. */
export interface Indicador {
  estudiante_publico: boolean;
  personal_hospital: boolean;
  accidente_laboral: boolean;
  discapacidad: boolean;
  accidente_transito: boolean;
  arma_fuego: boolean;
  arma_blanca: boolean;
  ambulancia: boolean;
  embarazo: boolean;
  viene_referido: string;
  fue_referido: string;
}

// ===================================================================
// CICLO CLÍNICO (UN REGISTRO EN EL HISTORIAL)
// ===================================================================
/** Evento individual del historial clínico, con estado y datos de auditoría. */
export interface CicloClinico {
  // ✅ Campos obligatorios de auditoría
  estado: EstadoCiclo;
  registro?: string;  // ISO timestamp
  usuario?: string;
  especialidad?: string;
  servicio?: string;
  comentario?: string;
}

/** Campos modificables de un ciclo, excluyendo usuario y fecha de auditoría. */
export type CicloPatch = Omit<
  CicloClinico,
  'usuario' | 'registro'
>;

// ✅ Alias para compatibilidad con código legacy
/** Alias conservado para consumidores que usan el nombre histórico `Ciclo`. */
export type Ciclo = CicloClinico;

/** Campos compartidos por las representaciones de consulta. */
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
  ciclo?: CicloClinico[];
  orden?: number;
  ultimo_estado?: string;
  egreso?: Egreso;

}

/** Payload general para crear una consulta nueva. */
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

/** Payload usado por el flujo de admisión, incluido el primer evento del ciclo. */
export interface RegistroConsultaCreate {
  paciente_id: number;
  tipo_consulta: number;
  especialidad: string;
  servicio: string;
  indicadores: Indicador;
  ciclo: CicloClinico[];  // ✅ Array con el primer registro
}

// ✅ Para REGISTRAR una nueva consulta (todos obligatorios)

/** Consulta recién registrada devuelta por el backend. */
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
  ciclo: CicloClinico[];
  orden: number;
  egreso?: Egreso;
}

// ✅ Para ACTUALIZAR consultas (todo opcional excepto id)
/** Campos parciales que puede recibir la operación de actualización. */
export interface ConsultaUpdate {
  expediente?: string;
  tipo_consulta?: number;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  fecha_consulta?: string;
  hora_consulta?: string;
  indicadores?: Indicador;
  ciclo?: CicloClinico;
  orden?: number;
  egreso?: Egreso;
}


// ✅ ConsultaOut NO incluye created_at/updated_at
/** Consulta completa de salida; el ciclo conserva el orden de eventos clínicos. */
export interface ConsultaOut {
  id: number;
  paciente: Paciente;
  expediente?: string;
  paciente_id?: number;
  tipo_consulta?: number;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  fecha_consulta?: string;
  hora_consulta?: string;
  indicadores?: Indicador;
  ciclo?: CicloClinico[];
  orden?: number;
  ultimo_estado?: string;
  activo?: boolean;
  egreso?: Egreso;
  dias_acumulados?: number;

}
// Para respuestas de listas con paginación
/** Resultado paginado de consultas. */
export interface ConsultaListResponse {
  total: number;
  consultas: ConsultaOut[];
}

// Respuesta detallada con datos del paciente (si la usas)
/** Respuesta de detalle que incluye los datos del paciente relacionado. */
export interface ConsultaResponse extends ConsultaBase {
  id: number;
  expediente?: string;
  paciente: Paciente;
}

/** Resumen de consulta usado en el historial de un paciente. */
export interface ConsultasIdPaciente {
  id: number;
  tipo_consulta: number;
  documento?: string;
  especialidad: string;
  servicio?: string;
  fecha_consulta: string;
  hora_consulta: string;
  ultimo_estado?: string;
}


/** Consulta y paciente unidos para vistas de historia clínica. */
export interface ConsultaPacienteResumen {
  id: number;
  expediente?: string;
  tipo_consulta?: number;
  especialidad?: string;
  servicio?: string;
  documento?: string;
  fecha_consulta?: string;
  hora_consulta?: string;
  indicadores?: Indicador;
  ciclo?: CicloClinico;
  orden?: number;
  egreso?: Egreso;
  paciente: PacienteJoin;
  ultimo_estado?: string;

}

// ===================================================================
// TOTALES Y ESTADÍSTICAS
// ===================================================================
/** Indicador individual del resumen estadístico del sistema. */
export interface TotalesItem {
  entidad: string;    // Nombre del indicador
  total: number;      // Cantidad
  icono?: string;     // Icono para UI
  color?: string;     // Color del card
}

/** Resumen de totales con el momento de generación del servidor. */
export interface TotalesResponse {
  totales: TotalesItem[];
  generado_en: string;  // Timestamp ISO
}

/** Alias de un indicador estadístico individual. */
export type Totales = TotalesItem;  // Alias para compatibilidad


// ===================================================================
// ENUM DE CAMPOS CLÍNICOS (PARA REFERENCIAS)
// ===================================================================
/** Claves estables usadas para identificar secciones del registro clínico. */
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
/** Códigos numéricos de los tipos principales de consulta. */
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
    personal_hospital: false,
    accidente_laboral: false,
    discapacidad: false,
    accidente_transito: false,
    arma_fuego: false,
    arma_blanca: false,
    ambulancia: false,
    embarazo: false,
    viene_referido: '',
    fue_referido: ''
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
 * Cuenta los registros de ciclo por estado
 */
export function contarPorEstado(consulta: ConsultaOut): Record<EstadoCiclo, number> {
  const conteo = {} as Record<EstadoCiclo, number>;

  (consulta.ciclo || []).forEach(c => {
    conteo[c.estado] = (conteo[c.estado] || 0) + 1;
  });

  return conteo;
}


/** Campos mínimos devueltos por la búsqueda de pacientes desde consultas. */
export interface PacienteBuscado {
  id: number,
  cui: number,
  expediente: string,
  nombre_completo: string,
  fecha_nacimiento: string

}

/** Contenedor de resultados de búsqueda usados en recepción. */
export interface PacientesBuscado {
  pacientes: Paciente[];
}
