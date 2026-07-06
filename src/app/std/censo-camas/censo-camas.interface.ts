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

export interface ServicioResumen {
  servicio_id: number;
  servicio_nombre: string;
  camas_censables: number;
  masculino: CensoCamasOut | null;
  femenino: CensoCamasOut | null;
}

export interface CensoDiarioResumen {
  fecha: string;
  servicios: ServicioResumen[];
  total_ocupados: number;
  promedio: number;
}

export interface CensoCamasListResponse {
  total: number;
  registros: CensoCamasOut[];
}

export interface CensoCamasFiltros {
  fecha?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  servicio_id?: number | null;
  sexo?: number | null;
  skip?: number;
  limit?: number;
}

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

export interface CensoEstadisticaResponse {
  desde: string;
  hasta: string;
  servicios: CensoEstadisticaServicio[];
  global: CensoEstadisticaGlobal;
}
