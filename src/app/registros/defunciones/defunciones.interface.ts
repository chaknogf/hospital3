import { DefuncionOut as ConsDefuncionOut } from '../../interface/consDef';
import { Medico } from '../../interface/medicos.interface';

export interface Defuncion extends ConsDefuncionOut {
  id: number;
}

export interface DefuncionListResponse {
  total: number;
  defunciones: Defuncion[];
  skip: number;
  limit: number;
}

export interface PacienteFallecido {
  id: number;
  expediente?: string;
  cui?: string;
  nombre_completo?: string;
  nombre?: Record<string, string>;
  sexo?: string;
  fecha_nacimiento?: string;
  estado?: string;
  nombres?: string | null;
  apellidos?: string | null;
  tiene_defuncion?: boolean;
  defuncion?: {
    id: number;
    fecha_defuncion?: string;
    medico_id?: number;
    causa_a?: string;
    causa_b?: string;
    causa_c?: string;
    causa_d?: string;
    edad_anios?: number;
    muerte_gestacion?: string;
    es_fetal?: boolean;
    mujer_edad_fertil?: boolean;
    lugar_lesion?: string;
    fue_presunto?: string;
  };
}

export interface DatosPersonaInfo {
  nombres?: string | null;
  apellidos?: string | null;
  cui?: string | null;
  documento_tipo?: string | null;
  numero_libro?: string | null;
  numero_folio?: string | null;
  numero_partida?: string | null;
  sexo?: string | null;
  nacionalidad?: string | null;
  ocupacion?: string | null;
  estado_civil?: string | null;
  pueblo_pertenencia?: string | null;
  escolaridad?: string | null;
  lugar_nacimiento_pais?: string | null;
  lugar_nacimiento_departamento?: string | null;
  lugar_nacimiento_municipio?: string | null;
  residencia_direccion?: string | null;
  residencia_municipio?: string | null;
  residencia_departamento?: string | null;
}

export type FallecidoInfo = DatosPersonaInfo;
export type MadreInfo = DatosPersonaInfo;

export interface DefuncionOut {
  id: number;
  medico_id?: number | null;
  fecha_defuncion?: string | null;
  paciente_id?: number | null;

  fallecido_edad_horas?: number | null;
  fallecido_edad_dias?: number | null;
  fallecido_edad_meses?: number | null;
  fallecido_edad_anios?: number | null;

  mujer_edad_fertil?: boolean;
  muerte_gestacion?: string | null;

  causa_a?: string | null;
  causa_b?: string | null;
  causa_c?: string | null;
  causa_d?: string | null;
  causa_intervalo?: string | null;
  causa_otros?: string | null;

  fue_presunto?: string | null;
  lugar_lesion?: string | null;
  ocurrio_trabajo?: boolean | null;
  accidente_transito?: boolean | null;
  arma?: string | null;

  madre_id?: number | null;
  madre_edad?: number | null;
  madre_sabe_leer_escribir?: string | null;

  es_fetal?: boolean;
  embarazos_previvos_vivos?: number | null;
  embarazos_previvos_muertos?: number | null;
  fetal_sexo?: string | null;
  fetal_murio_antes_parto?: boolean | null;
  fetal_parto_tipo?: string | null;
  fetal_clase_parto?: string | null;
  fetal_via_parto?: string | null;
  fetal_semanas_gestacion?: number | null;
  fetal_causas_fetales?: string | null;
  fetal_causas_maternas?: string | null;

  registrador_id?: number | null;
  observaciones?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  paciente?: FallecidoInfo | null;
  madre?: MadreInfo | null;
  medico?: Medico | null;

  informante_tipo?: string | null;
  informante_documento?: string | null;

  lugar_defuncion_direccion?: string | null;
  lugar_defuncion_municipio?: string | null;
  lugar_defuncion_departamento?: string | null;
  hubo_necropsia?: string | null;
  clase_asistencia?: string | null;
  lugar_ocurrio_defuncion?: string | null;
}

export interface DefuncionBase {
  medico_id?: number;
  fecha_defuncion?: string;
  mujer_edad_fertil?: boolean;
  muerte_gestacion?: string;

  causa_a: string;
  causa_b?: string;
  causa_c?: string;
  causa_d?: string;
  causa_intervalo?: string;
  causa_otros?: string;

  fue_presunto?: string;
  lugar_lesion?: string;
  ocurrio_trabajo?: boolean;
  accidente_transito?: boolean;
  arma?: string;

  es_fetal?: boolean;
  madre_id?: number;
  madre_edad?: number;
  madre_sabe_leer_escribir?: string;

  embarazos_previvos_vivos?: number;
  embarazos_previvos_muertos?: number;
  fetal_sexo?: string;
  fetal_murio_antes_parto?: boolean;
  fetal_parto_tipo?: string;
  fetal_clase_parto?: string;
  fetal_via_parto?: string;
  fetal_semanas_gestacion?: number;
  fetal_causas_fetales?: string;
  fetal_causas_maternas?: string;

  fallecido_edad_horas?: number;
  fallecido_edad_dias?: number;
  fallecido_edad_meses?: number;
  fallecido_edad_anios?: number;

  registrador_id?: number;
  observaciones?: string;
}

export interface DefuncionCreate extends DefuncionBase {
  paciente_id: number;
}

export interface RegistrarDefuncionRequest extends DefuncionBase { }

export type DefuncionUpdate = Partial<DefuncionBase>;

export interface PacientesFallecidosResponse {
  pacientes: PacienteFallecido[];
  total: number;
  skip: number;
  limit: number;
}
