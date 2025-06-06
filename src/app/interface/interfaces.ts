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
  primer: string;
  segundo?: string;
  otro?: string;
  apellido_primero: string;
  apellido_segundo?: string;
  casada?: string;
}

export interface Contacto {
  direccion?: string;
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



export interface DatosExtra {
  tipo: string;
  valor: string
}


// export interface DatosExtraKey {
//   nacionalidad?: string;
//   estado_civil?: string;
//   pueblo?: string;
//   idioma?: string;
//   ocupacion?: string;
//   nivel_educativo?: string;
//   peso_nacimiento?: string;
//   edad_gestacional?: string;
//   parto?: string;
//   gemelo?: string;
//   expediente_madre?: string;
// }

export interface Paciente {
  id: number
  unidad?: number;
  identificadores?: Identificadores;
  nombre: Nombre;
  sexo?: string;
  fecha_nacimiento?: string;
  contacto?: Contacto;
  referencias?: { [key: string]: Referencia };
  datos_extra?: { [key: string]: DatosExtra };
  estado?: string;
  metadatos?: { [key: string]: Metadata };
}







export interface Correlativo {
  correlativo: number
}
