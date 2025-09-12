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
export interface Identificadores {
  cui?: number;
  expediente?: string;
  pasaporte?: string;
  otro?: string;
}

export interface Nombre {
  primer_nombre: string;
  segundo_nombre?: string;
  otro_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  apellido_casada?: string;
}

export interface Contacto {
  direccion?: string;
  localidad?: string;
  departamento?: string;
  municipio?: string;
  telefono?: string;
  telefono2?: string;
  telefono3?: string;
}

export interface Referencia {
  nombre: string;
  parentesco?: string;
  telefono?: string;
}


export interface Metadata {
  usuario?: string;
  registro?: string;
}

export interface KeysValue {
  tipo: string;
  valor: string;
}

export interface DatosExtra {
  [key: string]: KeysValue;   // dinámico: r0, r1, r2...
}

export interface Paciente {
  id: number;
  unidad?: number;
  cui?: number;
  expediente?: string;
  pasaporte?: string;
  otro?: string;
  nombre: Nombre;
  sexo?: string;
  fecha_nacimiento?: string;
  contacto?: Contacto;
  referencias?: { [key: string]: Referencia };
  datos_extra?: DatosExtra;   // ya no es objeto de objetos
  estado?: string;
  metadatos?: { [key: string]: Metadata };
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

