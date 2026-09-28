/** Movimientos reportados para uno de los sexos dentro del censo diario. */
export interface CensoCamasSexoCreate {
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

/** Cambios parciales de los movimientos de un sexo. */
export interface CensoCamasSexoUpdate {
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

/** Datos de salida de un sexo, incluidos los cálculos del servidor. */
export interface CensoCamasSexoOut extends CensoCamasSexoCreate {
  camas_ocupadas: number;
  egresos_totales: number;
}

/** Solicitud conjunta: una fecha y servicio contienen ambos desgloses. */
export interface CensoCamasCreate {
  fecha: string;
  servicio_id: number;
  masculino: CensoCamasSexoCreate;
  femenino: CensoCamasSexoCreate;
}

/** Campos actualizables en un censo diario ya existente. */
export interface CensoCamasUpdate {
  masculino?: Partial<CensoCamasSexoCreate>;
  femenino?: Partial<CensoCamasSexoCreate>;
}

/** Totales agregados de ambos sexos devueltos por la API. */
export interface CensoCamasTotales extends CensoCamasSexoCreate {
  camas_ocupadas: number;
  egresos_totales: number;
}

/** Único registro diario por servicio, con movimientos separados por sexo. */
export interface CensoCamasOut {
  id: number;
  fecha: string;
  servicio_id: number;
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
  masculino: CensoCamasSexoOut;
  femenino: CensoCamasSexoOut;
  totales: CensoCamasTotales;
  created_at: string;
  updated_at: string;
}

/** Agrega el censo masculino y femenino de un servicio en una fecha. */
export interface ServicioResumen {
  servicio_id: number;
  servicio_nombre: string;
  camas_censables: number;
  masculino: CensoCamasSexoOut | null;
  femenino: CensoCamasSexoOut | null;
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

/** Ocupación y movimientos de un servicio para el censo de una fecha. */
export interface HospitalizacionDiariaItem {
  servicio_id: number;
  servicio_nombre: string;
  camas_censables: number;
  camas_ocupadas: number;
  camas_disponibles: number;
  porcentaje_ocupacional: number;
  egresos_diarios: number;
  egresos_contraindicados: number;
  fallecidos: number;
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
