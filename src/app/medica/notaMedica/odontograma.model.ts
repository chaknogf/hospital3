export type DenticionDental = 'permanente' | 'temporal';

export type SuperficieDental = 'vestibular' | 'mesial' | 'oclusal' | 'distal' | 'lingual';

export interface PiezaDental {
  estado?: string;
  superficies?: Partial<Record<SuperficieDental, string>>;
}

export interface Odontograma {
  denticion: DenticionDental;
  dientes: Record<string, PiezaDental>;
}

export interface NotaOdontologica {
  motivo_consulta: string;
  examen_extraoral: string;
  examen_intraoral: string;
  diagnostico: string;
  plan_tratamiento: string;
  procedimientos: string;
  odontograma: Odontograma;
}
