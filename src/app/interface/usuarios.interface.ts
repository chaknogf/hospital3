
/** Atributos laborales y de identificación complementarios del usuario. */
export interface DatosExtraUser {
  cui?: string;
  sexo?: string;
  puesto?: string;
  servicio?: string;
}

/** Datos editables de cuenta usados en formularios administrativos. */
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

/** Usuario devuelto por el backend con identificador asignado. */
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

/** Página de usuarios para las vistas de administración. */
export interface UsersListResponse {
  total: number;
  usuarios: UsuarioOut[];
}

/** Datos mínimos requeridos por el flujo de creación de usuario. */
export interface CrearUsuario {
  nombre: string;
  username: string;
  email?: string;
}

/** Credenciales opcionales enviadas por operaciones de recuperación. */
export interface Passreset {
  email?: string;
  password?: string;
}
