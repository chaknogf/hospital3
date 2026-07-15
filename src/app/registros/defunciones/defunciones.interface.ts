import { DefuncionOut, DefuncionPacienteResumen, DefuncionMedicoResumen } from '../../interface/consDef';

export interface Defuncion extends DefuncionOut {
  id: number;
}

export interface DefuncionListResponse {
  total: number;
  defunciones: Defuncion[];
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
