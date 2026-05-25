// =========================================================
// RESPONSE — incluye usuarios (solo lectura, asignados por backend)
// =========================================================
export interface Prestamo {
  id: number;
  id_paciente: number;
  id_consulta?: number | null;
  expediente?: string | null;
  fecha_prestamo?: string | null;
  fecha_limite?: string | null;
  fecha_devolucion?: string | null;
  usuario_entrega?: string | null;
  usuario_recibe?: string | null;
  solicitante: string;
  motivo?: string | null;
  tipo_documento?: string;
  activo?: boolean;
  ubicacion?: string | null;
  nota?: string | null;
  created_at: string;
  updated_at: string;
}

// =========================================================
// CREATE — el frontend NO envía usuario_entrega (lo pone el backend)
// =========================================================
export interface PrestamoCreate {
  id_paciente: number;
  id_consulta?: number | null;
  expediente?: string | null;
  fecha_prestamo?: string | null;
  fecha_limite?: string | null;
  fecha_devolucion?: string | null;
  solicitante: string;
  motivo?: string | null;
  tipo_documento?: string;
  activo?: boolean;
  ubicacion?: string | null;
  nota?: string | null;
}

// =========================================================
// UPDATE — el frontend NO envía usuario_recibe
//          (el backend lo asigna cuando llega fecha_devolucion)
// =========================================================
export interface PrestamoUpdate {
  id_consulta?: number | null;
  expediente?: string | null;
  fecha_prestamo?: string | null;
  fecha_limite?: string | null;
  fecha_devolucion?: string | null;
  solicitante?: string | null;
  motivo?: string | null;
  tipo_documento?: string | null;
  activo?: boolean | null;
  ubicacion?: string | null;
  nota?: string | null;
}

// =========================================================
// FILTROS
// =========================================================
export interface FiltroPrestamos {
  activo?: boolean | null;
  id_paciente?: number | null;
}
