/** Datos de usuario con credenciales y estado, usados en flujos heredados. */
export interface Usuarios {
  id: number;
  nombre: string;
  username: string;
  password: string;
  email: string;
  role: string;
  estado: string;
}

/** Identidad autenticada disponible para la interfaz. */
export interface Currentuser {
  id: number;
  username: string;
  role: string;
  nombre?: string;
  email?: string;
}



// pacientes
/** Componentes del nombre legal de una persona registrada. */
export interface Nombre {
  primer_nombre: string;
  segundo_nombre?: string | null;
  otro_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  apellido_casada?: string | null;
}

/** Datos de contacto y domicilio asociados a una persona. */
export interface Contacto {
  domicilio?: string | null;
  municipio?: string | null;
  telefonos?: string | null;
  email?: string | null;
}

/** Contacto de referencia, responsable o acompañante del paciente. */
export interface Referencia {
  nombre: string;
  parentesco?: string | null;
  telefono?: string | null;
  expediente?: string | null;
  idpersona?: string | null;
  responsable?: boolean | false;
  acompanante?: boolean | false;
}

// ========== DATOS EXTRA ==========

/** Datos demográficos complementarios mantenidos en el expediente. */
export interface Demograficos {
  idioma?: number | null;
  pueblo?: number | null;
  nacionalidad?: string | null;
  departamento_nacimiento?: string | null;
  lugar_nacimiento?: string | null;
  vecindad?: string | null;
}

/** Datos socioeconómicos codificados según los valores aceptados por la API. */
export interface Socioeconomicos {
  estado_civil?: number | null;
  ocupacion?: string | null;
  educacion?: number | null;
  estudiante_publico?: 'S' | 'N';
  personal_hospital?: 'S' | 'N';
  discapacidad?: 'S' | 'N';
}

/** Información clínica específica de nacimiento y atención neonatal. */
export interface Neonatales {
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  tipo_parto?: 'Simple' | 'Doble' | 'Multiple' | null;
  clase_parto?: 'Pes' | 'Cstp' | null;
  gemelo?: string | null;
  expediente_madre?: string | null;
  extrahositalario?: boolean | false;
  hora_nacimiento?: string | null;
  id_medico?: number | null;
}

/** Conteos de nacidos vivos y muertos asociados al registro materno. */
export interface Partos {
  nacidos_vivos?: number | null;
  nacidos_muertos?: number | null;
}

/** Secciones complementarias del paciente; admite claves legacy adicionales. */
export interface DatosExtra {
  defuncion?: string | null;
  personaid?: string | null;
  demograficos?: Demograficos;
  socioeconomicos?: Socioeconomicos;
  neonatales?: Neonatales;
  partos?: Partos | null;
  [key: string]: any; // Para campos adicionales dinámicos
}

// ========== METADATOS ==========
/** Auditoría de una creación o actualización de datos del expediente. */
export interface EventoMetadato {
  usuario: string;
  registro: string;       // ISO datetime
  accion: 'CREADO' | 'ACTUALIZADO';
  expediente_duplicado?: boolean;
}
/** Variante flexible de metadatos recibida de registros legacy. */
export interface Metadata {
  usuario?: string;
  registro?: any;       // ISO datetime
  accion?: 'CREADO' | 'ACTUALIZADO';
  expediente_duplicado?: boolean;
}

// ========== PACIENTE ==========

/** Modelo completo del paciente intercambiado con servicios y almacenamiento local. */
export interface Paciente {
  id: number;
  cui?: number | null;
  expediente?: string | null;
  pasaporte?: string | null;
  nombre: Nombre;
  nombre_completo?: string;
  sexo?: 'F' | 'M' | 'O'; // F = Femenino, M = Masculino, O = Otro
  fecha_nacimiento?: string | null;
  contacto?: Contacto;
  referencias?: Referencia[];
  datos_extra?: DatosExtra;
  idioma_id?: number | null;
  pueblo_id?: number | null;
  nacionalidad?: string | null;
  lugar_nacimiento?: string | null;
  estado?: 'V' | 'F' | 'I'; // V = Vivo, F = Fallecido, I = Inactivo
  metadatos?: EventoMetadato[];
  creado_en?: string | null;
  actualizado_en?: string | null;
  defuncion?: string;
  personal_hospital?: 'S' | 'N' | null;
}

/** Proyección liviana de paciente usada en listados y búsquedas. */
export interface PacienteResumen {
  id: number;
  cui?: number | null;
  expediente?: string | null;
  pasaporte?: string | null;
  nombre: Nombre;
  nombre_completo?: string;
  sexo?: 'F' | 'M' | 'O'; // F = Femenino, M = Masculino, O = Otro
  fecha_nacimiento?: string | null;
  estado?: 'V' | 'F' | 'I'; // V = Vivo, F = Fallecido, I = Inactivo
  defuncion?: string;
  ultima_consulta?: string | null;
}

/** Resultado paginado de búsqueda de pacientes. */
export interface PacienteListResponse {
  total: number;
  pacientes: PacienteResumen[];
}


/** Número secuencial emitido por el backend para un documento. */
export interface Correlativo {
  correlativo: number
}

// municipios

/** Municipio con códigos territoriales y nombre de vecindad. */
export interface Municipio {
  codigo: string;
  vecindad: string;
  municipio: string;
  departamento: string;
}

/** País identificado por nombre y código ISO de tres letras. */
export interface PaisesIso {
  nombre: string;
  codigo_iso3: string;
}


/** Campos de identidad que puede devolver la consulta al registro RENAP. */
export interface Renap {
  CUI?: string;
  PRIMER_NOMBRE?: string;
  SEGUNDO_NOMBRE?: string;
  TERCER_NOMBRE?: string;
  PRIMER_APELLIDO?: string;
  SEGUNDO_APELLIDO?: string;
  APELLIDO_CASADA?: string;
  SEXO?: string;
  ESTADO_CIVIL?: string;
  FECHA_NACIMIENTO?: string;
}

/** Conteo agregado de una entidad para indicadores de la aplicación. */
export interface Totales {
  entidad: string;
  total: number;
}



/** Datos de un recién nacido dentro de un registro de madre e hijos. */
export interface HijodeItem {
  sexo: 'M' | 'F';
  datos_extra: HijodeDatosExtra;
}

/** Información de nacimiento múltiple vinculada a la madre. */
export interface Hijode {
  fecha_nacimiento: string;       // Formato: YYYY-MM-DD
  estado: 'V' | 'F';              // Vivo o Fallecido
  hijos: HijodeItem[];            // Uno por recién nacido
}

/** Atributos neonatales enviados al crear hijos desde el expediente materno. */
export interface HijodeDatosExtra {
  peso_nacimiento?: string;      // en lb.oz
  edad_gestacional?: string;     // en semanas
  tipo_parto?: string;           // ej: "pes", "cesarea"
  clase_parto?: string;          // ej: "simple", "gemelar"
  extrahositalario?: boolean;    // nacimiento extra-hospitalario
  hora_nacimiento?: string;      // Formato: HH:MM:SS.000Z
  id_medico?: number | null;     // Médico que atendió el parto
}

/** Respuesta del backend con pacientes creados desde una madre. */
export interface MadreHijoResponse {
  pacientes: Paciente[];
  total: number;
}

/** Campos del paciente incluidos por una relación en otra respuesta API. */
export interface PacienteJoin {
  id: number;
  expediente?: string | null;
  nombre: Nombre;
  sexo?: string;
  fecha_nacimiento?: string | null;
  contacto?: Contacto;
  defuncion?: string;
}

/** Servicio de hospitalización y su capacidad censable. */
export interface Encamamiento {
  id: number;
  nombre_servicio: string;
  descripcion?: string | null;
  camas_censables: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

/** Resultado paginado del catálogo municipal. */
export interface MunicipioListResponse {
  total: number;
  municipios: Municipio[];
}

/** Departamento devuelto por el catálogo geográfico. */
export interface DepartamentoOut {
  codigo: string;
  departamento: string;
}

/** Página de eventos de auditoría devuelta por el backend. */
export interface AuditLogResponse {
  total: number;
  logs: AuditLogEntry[];
}

/** Evento de auditoría de una solicitud realizada a la API. */
export interface AuditLogEntry {
  id: number;
  fecha_hora: string;
  username: string;
  tabla: string;
  registro_id: number | null;
  endpoint: string;
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  ip_address: string;
  so: string | null;
  nombre_equipo: string | null;
  user_agent: string;
}
