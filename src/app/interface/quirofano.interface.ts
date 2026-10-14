/** Catálogo de formatos de procedimiento quirúrgico. */
export interface FormatoProcedimiento {
  formato_procedimiento_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Estado disponible para clasificar una intervención. */
export interface EstadoCirugia {
  estado_cirugia_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Rango profesional del especialista responsable de la intervención. */
export interface RangoEspecialista {
  rango_especialista_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Catálogo de procedencia del procedimiento quirúrgico. */
export interface ProcedenciaProcedimiento {
  procedencia_procedimiento_id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Especialidad clínica y su disponibilidad para sala de operaciones. */
export interface Especialidad {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  codigo?: string | null;
  estado: boolean;
  sop: boolean;
}

/** Procedimiento del catálogo quirúrgico asociado a una especialidad. */
export interface ProcedimientoQuirofano {
  procedimiento_quirofano_id: number;
  codigo: string;
  nombre: string;
  especialidad_id: number | null;
  especialidad_nombre?: string | null;
  activo: boolean;
}

/** Sala quirúrgica identificada por número y estado de disponibilidad. */
export interface QuirofanoNumero {
  quirofano_numero_id: number;
  numero: number;
  nombre: string;
  activo: boolean;
}

/** Roles del equipo quirúrgico que apoyan la intervención (texto libre). */
export interface EquipoQuirurgico {
  circulante?: string | null;
  instrumentista?: string | null;
  pediatra?: string | null;
  medico_apoyo?: string | null;
}

/** Datos adicionales (columna JSONB `datos_extra`) de una intervención. */
export interface DatosExtraIntervencion {
  equipo?: EquipoQuirurgico;
  [key: string]: unknown;
}

/** Intervención persistida con paciente, tiempos, equipo y procedimientos. */
export interface IntervencionQuirurgica {
  intervencion_id: number;
  paciente_id: number;
  consulta_id?: number;
  paciente_nombre?: string;
  expediente?: string;
  personal_atencion_id?: number;
  personal_atencion_nombre?: string;
  quirofano_numero_id?: number;
  quirofano_numero_nombre?: string;
  procedimiento_principal?: string;
  procedimiento_principal_id?: number;
  procedimiento_principal_catalogo_nombre?: string;
  procedimiento_2?: string;
  procedimiento_2_id?: number;
  procedimiento_2_catalogo_nombre?: string;
  procedimiento_3?: string;
  procedimiento_3_id?: number;
  procedimiento_3_catalogo_nombre?: string;
  procedimiento_4?: string;
  procedimiento_4_id?: number;
  procedimiento_4_catalogo_nombre?: string;
  procedimiento_5?: string;
  procedimiento_5_id?: number;
  procedimiento_5_catalogo_nombre?: string;
  area_cuerpo_intervenida?: string;
  id_area_cuerpo_intervenida?: number;
  area_cuerpo_intervenida_nombre?: string;
  estado_cirugia_id?: number;
  estado_cirugia_nombre?: string;
  formato_procedimiento_id?: number;
  formato_procedimiento_nombre?: string;
  procedencia_procedimiento_id?: number;
  procedencia_procedimiento_nombre?: string;
  rango_especialista_id?: number;
  rango_especialista_nombre?: string;
  especialidad_id?: number;
  especialidad_nombre?: string;
  fecha: string;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
  datos_extra?: DatosExtraIntervencion | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Datos editables necesarios para crear una intervención quirúrgica. */
export interface IntervencionCreate {
  paciente_id: number;
  consulta_id?: number;
  expediente?: string;
  personal_atencion_id?: number;
  quirofano_numero_id?: number;
  estado_cirugia_id?: number;
  formato_procedimiento_id?: number;
  procedencia_procedimiento_id?: number;
  rango_especialista_id?: number;
  especialidad_id?: number;
  procedimiento_principal?: string;
  procedimiento_principal_id?: number;
  procedimiento_2?: string;
  procedimiento_2_id?: number;
  procedimiento_3?: string;
  procedimiento_3_id?: number;
  procedimiento_4?: string;
  procedimiento_4_id?: number;
  procedimiento_5?: string;
  procedimiento_5_id?: number;
  area_cuerpo_intervenida?: string;
  id_area_cuerpo_intervenida?: number;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
  datos_extra?: DatosExtraIntervencion | null;
}

/** Campos parciales permitidos al actualizar una intervención. */
export interface IntervencionUpdate {
  consulta_id?: number;
  personal_atencion_id?: number;
  quirofano_numero_id?: number;
  estado_cirugia_id?: number;
  formato_procedimiento_id?: number;
  procedencia_procedimiento_id?: number;
  rango_especialista_id?: number;
  especialidad_id?: number;
  procedimiento_principal?: string;
  procedimiento_principal_id?: number;
  procedimiento_2?: string;
  procedimiento_2_id?: number;
  procedimiento_3?: string;
  procedimiento_3_id?: number;
  procedimiento_4?: string;
  procedimiento_4_id?: number;
  procedimiento_5?: string;
  procedimiento_5_id?: number;
  area_cuerpo_intervenida?: string;
  id_area_cuerpo_intervenida?: number;
  hora_inicio_anestesia?: string;
  hora_inicio_intervencion?: string;
  hora_finaliza_intervencion?: string;
  hora_finaliza_limpieza_prepara_quirofano?: string;
  observaciones?: string;
  datos_extra?: DatosExtraIntervencion | null;
  activo?: boolean;
}

/** Resultado paginado de intervenciones quirúrgicas. */
export interface IntervencionListResponse {
  total: number;
  intervenciones: IntervencionQuirurgica[];
}

// ══════════════════════════════════════════════════════════
// REPORTES / RESUMEN DE QUIRÓFANOS
// ══════════════════════════════════════════════════════════

/** Configuración de jornada (apertura/cierre/días) por quirófano. */
export interface QuirofanoConfigPeriodo {
  config_periodo_id: number;
  quirofano_numero_id: number;
  quirofano_numero_nombre?: string | null;
  hora_apertura: string;
  hora_cierre: string;
  dias_habiles: number;
  activo: boolean;
}

/** Campos editables de la configuración de jornada. */
export interface QuirofanoConfigPeriodoUpdate {
  hora_apertura?: string | null;
  hora_cierre?: string | null;
  dias_habiles?: number | null;
  activo?: boolean | null;
}

/** Fila del detalle del reporte (columnas A..W de la hoja Q + ayudantes). */
export interface IntervencionReporteFila {
  no: number;
  intervencion_id: number;
  quirofano_numero_id?: number | null;
  fecha: string;
  paciente_nombre?: string | null;
  rango_medico?: string | null;
  especialidad?: string | null;
  medico?: string | null;
  procedencia?: string | null;
  formato?: string | null;
  procedimiento_1?: string | null;
  procedimiento_2?: string | null;
  procedimiento_3?: string | null;
  procedimiento_4?: string | null;
  procedimiento_5?: string | null;
  procedimientos?: string | null;
  area_cuerpo?: string | null;
  observaciones?: string | null;
  hora_inicio_anestesia?: string | null;
  hora_inicio_intervencion?: string | null;
  hora_finaliza_intervencion?: string | null;
  hora_finaliza_limpieza?: string | null;
  tiempo_intervencion_seg?: number | null;
  tiempo_uso_quirofano_seg?: number | null;
  tiempo_limpieza_seg?: number | null;
  estado?: string | null;
}

/** Indicadores agregados de un quirófano (o del total global). */
export interface KpiQuirofano {
  quirofano_numero_id?: number | null;
  numero?: number | null;
  nombre: string;
  hora_apertura?: string | null;
  hora_cierre?: string | null;
  es_fallback: boolean;
  dias_abiertos: number;
  tiempo_disponible_seg: number;
  horas_activo_seg: number;
  total_intervenciones: number;
  finalizadas: number;
  canceladas: number;
  reprogramadas: number;
  procedimientos_total: number;
  intervalos_dias_promedio?: number | null;
  tiempo_promedio_intervencion_seg?: number | null;
  tiempo_promedio_uso_quirofano_seg?: number | null;
  tiempo_promedio_limpieza_seg?: number | null;
  porcentaje_uso: number;
  tasa_cancelacion: number;
  tasa_cancelacion_con_reprogramadas: number;
}

/** Resumen agregado por procedimiento. */
export interface ProcedimientoResumenFila {
  procedimiento: string;
  cantidad: number;
  tiempo_promedio_seg?: number | null;
  porcentaje_uso: number;
  intervalo_dias_promedio?: number | null;
}

/** Detalle de un quirófano: sus KPIs y sus intervenciones. */
export interface QuirofanoReporteDetalle {
  kpi: KpiQuirofano;
  intervenciones: IntervencionReporteFila[];
}

/** Respuesta completa de `/quirofano/reportes/resumen`. */
export interface ResumenReporteResponse {
  fecha_desde: string;
  fecha_hasta: string;
  generado_en: string;
  filtros: {
    especialidad_id?: number | null;
    quirofano_numero_id?: number | null;
    hora_apertura?: string | null;
    hora_cierre?: string | null;
    dias_abiertos?: number | null;
  };
  kpi_global: KpiQuirofano;
  por_quirofano: QuirofanoReporteDetalle[];
  procedimientos: ProcedimientoResumenFila[];
  advertencias: string[];
}

/** Parámetros de consulta de los reportes de quirófano. */
export interface ReporteQuirofanoParams {
  fecha_desde: string;
  fecha_hasta: string;
  especialidad_id?: number;
  quirofano_numero_id?: number;
  hora_apertura?: string;
  hora_cierre?: string;
  dias_abiertos?: number;
}
