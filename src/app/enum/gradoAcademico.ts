export interface GradoAcademico {
  value: number;
  label: string;
}

export const gradoAcademicos: GradoAcademico[] = [
  { value: 1, label: 'No aplica' },
  { value: 2, label: 'Pre Primaria' },
  { value: 3, label: 'Primaria' },
  { value: 4, label: 'Básicos' },
  { value: 5, label: 'Diversificado' },
  { value: 6, label: 'Universidad' },
  { value: 7, label: 'Ninguno' },
  { value: 8, label: 'Otro' },
  { value: 9, label: 'No indica' },
]
