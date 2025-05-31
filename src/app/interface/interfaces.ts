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
export interface Paciente {
  id: number;
  unidad: number;
  identificadores: Identificadores[];
  nombre: Nombres;
  sexo: string;
  fecha_nacimiento: string;
  contacto: Contacto[];
  referencias: Referencias[];
  datos_extra: Extras[];
  estado: string;
  metadatos: Metadatos[];
}

export interface Nombres {
  primer: string;
  segundo: string;
  otro: string;
  apellido_primero: string;
  apellido_segundo: string;
  casada: string | null;
}

export interface Contacto {
  clave: string;
  valor: string;
}

export interface Referencias {
  nombre: string;
  telefono: string;
  parentesco: string;
}

export interface Identificadores {
  tipo: string;
  valor: string;
}

export interface Extras {
  tipo: string;
  valor: string;
}

export interface Metadatos {
  usuario: string;
  registro: string;
}

export interface Correlativo {
  correlativo: number
}
