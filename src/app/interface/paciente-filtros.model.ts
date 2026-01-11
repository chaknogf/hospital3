// paciente-filtros.model.ts
export interface PacienteFiltros {
  q?: any;
  id?: string;
  cui?: string;
  identificador?: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  nombre_completo?: string;
  sexo?: string;
  fecha_nacimiento?: string;
  referencias?: string;
  estado?: string;
  skip?: number;
  limit?: number;
}
