
export interface DatosExtraUser {
  cui?: string;
  sexo?: string;
  puesto?: string;
  servicio?: string;
}

export interface Usuario {
  id?: number;
  nombre: string;
  username: string;
  email?: string;
  role: string;
  unidad?: number | null;
  estado?: string;
  datos_extra?: DatosExtraUser;
}

export interface UsuarioOut {
  id: number;
  nombre: string;
  username: string;
  email?: string;
  role: string;
  unidad?: number | null;
  estado?: string;
  datos_extra?: DatosExtraUser;
}

export interface UsersListResponse {
  total: number;
  usuarios: UsuarioOut[];
}

export interface CrearUsuario {
  nombre: string;
  username: string;
  email?: string;
}

export interface Passreset {
  email?: string;
  password?: string;
}
