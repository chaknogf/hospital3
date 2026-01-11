export interface Usuarios {
  id: number;
  nombre: string;
  username: string;
  password: string;
  email: string;
  role: string;
  estado: string;
}

export interface Currentuser {
  id: number;
  username: string;
  role: string;
  nombre?: string;
  email?: string;
}

// pacientes
export interface Nombre {
  primer_nombre: string;
  segundo_nombre?: string | null;
  otro_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  apellido_casada?: string | null;
}

export interface Contacto {
  domicilio?: string | null;
  vecindad?: string | null;
  municipio?: string | null;
  telefonos?: string | null;
}

export interface Referencia {
  nombre: string;
  parentesco?: string | null;
  telefono?: string | null;
  expediente?: string | null;
  idpersona?: string | null;
  responsable?: boolean | false;
}

// ========== DATOS EXTRA ==========

export interface Demograficos {
  idioma?: number | null;
  pueblo?: number | null;
  nacionalidad?: string | null;
  lugar_nacimiento?: number | null;
  departamento_nacimiento?: number | null;
}

export interface Socioeconomicos {
  estado_civil?: number | null;
  ocupacion?: string | null;
  educacion?: number | null;
  estudiante_publico?: 'S' | 'N';
  empleado_publico?: 'S' | 'N';
  discapacidad?: 'S' | 'N';
}

export interface Neonatales {
  peso_nacimiento?: string | null;
  edad_gestacional?: string | null;
  parto?: 'P' | 'C' | null; // P = Vaginal, C = Cesárea
  gemelo?: string | null;
  expediente_madre?: string | null;
}

export interface DatosExtra {
  defuncion?: string | null;
  cuipersona?: string | null;
  demograficos?: Demograficos;
  socioeconomicos?: Socioeconomicos;
  neonatales?: Neonatales;
  [key: string]: any; // Para campos adicionales dinámicos
}

// ========== METADATOS ==========

export interface Metadata {

  creado_por?: string;
  creado_en?: string;
  logs?: string[];
  expediente_duplicado?: boolean;
  [key: string]: any; // Para campos adicionales
}

// ========== PACIENTE ==========

export interface Paciente {
  id: number;
  cui?: number | null;
  expediente?: string | null;
  pasaporte?: string | null;
  nombre: Nombre;
  nombre_completo?: string;
  sexo?: 'F' | 'M' | 'O'; // F = Femenino, M = Masculino, O = Otro
  fecha_nacimiento?: string;
  contacto?: Contacto;
  referencias?: Referencia[];
  datos_extra?: DatosExtra;
  estado?: 'V' | 'F'; // V = Vivo, F = Fallecido
  metadatos?: Metadata;
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface PacienteListResponse {
  total: number;
  pacientes: Paciente[];
}


export interface Correlativo {
  correlativo: number
}

// municipios

export interface Municipio {
  codigo: string;
  vecindad: string;
  municipio: string;
  departamento: string;
}

export interface PaisesIso {
  nombre: string;
  codigo_iso3: string;
}


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

export interface Totales {
  entidad: string;
  total: number;
}


