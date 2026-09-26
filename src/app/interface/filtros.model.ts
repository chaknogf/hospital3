// filtros.model.ts
/** Criterios de búsqueda y paginación aceptados por el listado de pacientes. */
export interface PacienteFiltros {
  q?: any;
  id?: string;
  cui?: string;
  expediente?: string;
  nombre?: string;
  identificador?: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  nombre_completo?: string;
  sexo?: string;
  fecha_nac?: string;
  referencias?: string;
  estado?: string;
  skip?: number;
  limit?: number;
}


/** Filtros opcionales para localizar consultas por paciente o datos clínicos. */
export type FiltroConsulta = Partial<{
  paciente_id: number;
  expediente: string;
  cui: number;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  tipo_consulta: number;
  especialidad: string;
  fecha: string;
}> & Record<string, any>;

/** Filtros opcionales para búsqueda y paginación de citas. */
export type FiltroCitas = Partial<{
  id?: number;
  expediente?: string;
  paciente_id?: number;
  especialidad?: string;
  fecha_cita?: string;
  limit?: number;

}> & Record<string, any>;
