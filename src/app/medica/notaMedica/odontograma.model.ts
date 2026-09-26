/** Dentición a la que pertenece una pieza del odontograma. */
export type DenticionDental = 'permanente' | 'temporal';

/** Superficie anatómica identificable en una pieza dental. */
export type SuperficieDental = 'vestibular' | 'mesial' | 'oclusal' | 'distal' | 'lingual';

/** Estado clínico y superficies registradas para una pieza dental. */
export interface PiezaDental {
  estado?: string;
  superficies?: Partial<Record<SuperficieDental, string>>;
}

/** Conjunto de piezas y dentición evaluada en la consulta odontológica. */
export interface Odontograma {
  denticion: DenticionDental;
  dientes: Record<string, PiezaDental>;
}

/** Datos odontológicos que se incorporan al ciclo de la nota médica. */
export interface NotaOdontologica {
  motivo_consulta: string;
  examen_extraoral: string;
  examen_intraoral: string;
  diagnostico: string;
  plan_tratamiento: string;
  procedimientos: string;
  odontograma: Odontograma;
}
