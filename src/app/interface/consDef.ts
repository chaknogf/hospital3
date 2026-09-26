/** Identidad resumida de la persona fallecida o de su madre. */
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

/** Datos básicos del profesional relacionado con la defunción. */
export interface DefuncionMedicoResumen {
  id: number;
  nombre?: string;
  colegiado?: number;
  especialidad?: string;
}

/** Constancia de defunción con causas, circunstancias y relaciones resueltas. */
export interface DefuncionOut {
  id: number;
  personal_atencion_id?: number;
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

/** Datos capturados para registrar una defunción. */
export interface DefuncionCreate {
  personal_atencion_id?: number;
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

/** Campos opcionales editables de una constancia de defunción. */
export interface DefuncionUpdate {
  personal_atencion_id?: number;
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

/** Listado de constancias de defunción con total para paginación. */
export interface DefuncionListResponse {
  total: number;
  defunciones: DefuncionOut[];
}

/** Paciente fallecido junto con el resumen de su constancia. */
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
    personal_atencion_id?: number;
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

/** Respuesta de búsqueda paginada de pacientes fallecidos. */
export interface PacientesFallecidosResponse {
  total: number;
  pacientes: PacienteFallecidoOut[];
}

/** Payload de registro de defunción asociado al paciente seleccionado. */
export interface RegistrarDefuncionRequest {
  personal_atencion_id?: number;
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
