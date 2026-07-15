export interface DefuncionPacienteResumen {
  id: number;
  expediente?: string;
  cui?: string | number;
  nombre_completo?: string;
  nombre?: Record<string, string>;
  sexo?: string;
  fecha_nacimiento?: string;
  estado?: string;
  defuncion?: string;
}

export interface DefuncionMedicoResumen {
  id: number;
  nombre?: string;
  colegiado?: number;
  especialidad?: string;
}

export interface DefuncionOut {
  id: number;
  medico_id?: number;
  fecha_defuncion?: string;
  paciente_id?: number;
  fallecido_edad_horas?: number;
  fallecido_edad_dias?: number;
  fallecido_edad_meses?: number;
  fallecido_edad_anios?: number;
  mujer_edad_fertil?: boolean;
  muerte_gestacion?: string;
  causa_a?: string;
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
  madre_id?: number;
  madre_edad?: number;
  madre_sabe_leer_escribir?: string;
  es_fetal?: boolean;
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
  registrador_id?: number;
  observaciones?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: DefuncionPacienteResumen;
  madre?: DefuncionPacienteResumen;
  medico?: DefuncionMedicoResumen;
}

export interface DefuncionCreate {
  medico_id?: number;
  fecha_defuncion?: string;
  paciente_id?: number;
  muerte_gestacion?: string;
  causa_a?: string;
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
  madre_id?: number;
  es_fetal?: boolean;
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
  observaciones?: string;
}

export interface DefuncionUpdate {
  medico_id?: number;
  fecha_defuncion?: string;
  paciente_id?: number;
  muerte_gestacion?: string;
  causa_a?: string;
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
  madre_id?: number;
  es_fetal?: boolean;
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
  observaciones?: string;
}

export interface DefuncionListResponse {
  total: number;
  defunciones: DefuncionOut[];
}

export interface PacienteFallecidoOut {
  id: number;
  expediente?: string;
  cui?: string;
  nombre_completo?: string;
  nombre?: Record<string, string>;
  sexo?: string;
  fecha_nacimiento?: string;
  estado?: string;
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

export interface PacientesFallecidosResponse {
  total: number;
  pacientes: PacienteFallecidoOut[];
}

export interface RegistrarDefuncionRequest {
  medico_id?: number;
  fecha_defuncion?: string;
  muerte_gestacion?: string;
  causa_a?: string;
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
  madre_id?: number;
  es_fetal?: boolean;
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
  observaciones?: string;
}
