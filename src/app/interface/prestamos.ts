// =========================================================
// RESPONSE — incluye usuarios (solo lectura, asignados por backend)
// =========================================================
/** Préstamo persistido de expediente o documento clínico. */
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
/** Datos de alta; el backend asigna el usuario que entrega el documento. */
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
/** Cambios de préstamo; el backend asigna quién recibe al registrar devolución. */
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
// RESPONSE PAGINADO (nuevo — coincide con PrestamoListResponse del backend)
// =========================================================
/** Página de préstamos devuelta por el backend. */
export interface PrestamoListResponse {
  total: number;
  items: Prestamo[];
}

// =========================================================
// FILTROS — ampliados
// =========================================================
/** Criterios de búsqueda, periodo y paginación de préstamos. */
export interface FiltroPrestamos {
  activo?: boolean | null;
  id_paciente?: number | null;
  expediente?: string | null;        // ← nuevo
  tipo_documento?: string | null;    // ← nuevo
  nombre_paciente?: string | null;   // ← nuevo
  fecha_desde?: string | null;       // ← rango (YYYY-MM-DD)
  fecha_hasta?: string | null;       // ← rango (YYYY-MM-DD)
  skip?: number;                     // ← paginación
  limit?: number;                    // ← paginación
}
