/** Datos diarios reportados para un servicio y sexo determinados. */
export interface CensoCamasCreate {
  fecha: string;
  servicio_id: number;
  sexo: number;
  ocupados: number;
  egresos: number;
  fallecidos: number;
  referido: number;
  traslado: number;
  contraindicados: number;
  otro_ingresos: number;
  ingresos: number;
  huespedes: number;
  emergencia: number;
}

/** Campos modificables de un registro de censo ya existente. */
export interface CensoCamasUpdate {
  ocupados?: number;
  egresos?: number;
  fallecidos?: number;
  referido?: number;
  traslado?: number;
  contraindicados?: number;
  otro_ingresos?: number;
  ingresos?: number;
  huespedes?: number;
  emergencia?: number;
}

/** Registro persistido con los totales calculados por el servidor. */
export interface CensoCamasOut {
  id: number;
  fecha: string;
  servicio_id: number;
  sexo: number;
  ocupados: number;
  camas_ocupadas: number;
  egresos_totales: number;
  egresos: number;
  fallecidos: number;
  referido: number;
  traslado: number;
  contraindicados: number;
  otro_ingresos: number;
  ingresos: number;
  huespedes: number;
  emergencia: number;
  created_at: string;
  updated_at: string;
}

/** Agrega el censo masculino y femenino de un servicio en una fecha. */
export interface ServicioResumen {
  servicio_id: number;
  servicio_nombre: string;
  camas_censables: number;
  masculino: CensoCamasOut | null;
  femenino: CensoCamasOut | null;
}

/** Resumen de ocupación de todos los servicios para un día. */
export interface CensoDiarioResumen {
  fecha: string;
  servicios: ServicioResumen[];
  total_ocupados: number;
  promedio: number;
}

/** Página de resultados del listado de censos. */
export interface CensoCamasListResponse {
  total: number;
  registros: CensoCamasOut[];
}

/** Filtros opcionales del listado de censos y su paginación. */
export interface CensoCamasFiltros {
  fecha?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  servicio_id?: number | null;
  sexo?: number | null;
  skip?: number;
  limit?: number;
}

/** Indicadores de ocupación y rotación calculados por servicio en un rango. */
export interface CensoEstadisticaServicio {
  servicio_id: number;
  servicio_nombre: string;
  camas_censables: number;
  dias_en_rango: number;
  dco: number;
  egresos_totales: number;
  porcentaje_ocupacion: number;
  dcd: number;
  dias_estancia: number;
  rotacion: number;
}

/** Indicadores agregados de todos los servicios del rango consultado. */
export interface CensoEstadisticaGlobal {
  camas_censables_total: number;
  dias_en_rango: number;
  dco: number;
  egresos_totales: number;
  porcentaje_ocupacion: number;
  dcd: number;
  dias_estancia: number;
  rotacion: number;
}

/** Resultado completo de las estadísticas del censo para un período. */
export interface CensoEstadisticaResponse {
  desde: string;
  hasta: string;
  servicios: CensoEstadisticaServicio[];
  global: CensoEstadisticaGlobal;
}

/** Conteo de hospitalizaciones agrupado por especialidad y sexo. */
export interface HospitalizacionEspecialidadItem {
  especialidad: string;
  masculinos: number;
  femeninos: number;
  total: number;
  dias_promedio_estancia: number;
  servicio_encamamiento: string | null;
}

/** Resultado agrupado de hospitalizaciones para el rango solicitado. */
export interface HospitalizacionEspecialidadResponse {
  desde: string;
  hasta: string;
  total_hospitalizados: number;
  especialidades: HospitalizacionEspecialidadItem[];
}

/** Cantidades afectadas al replicar un censo entre dos fechas. */
export interface CopiarDiaResponse {
  origen: string;
  destino: string;
  copiados: number;
  actualizados: number;
  sin_datos: number;
}
