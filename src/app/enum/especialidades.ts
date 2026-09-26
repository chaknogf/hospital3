
/** Opción de catálogo con código de dominio y etiqueta visible. */
export interface KeyValue {
  value: string;
  label: string;
}

/** Códigos de especialidad compartidos con consultas y formularios. */
export const Especialidades: KeyValue[] = [
  { value: 'MEDI', label: 'Medicina Interna' },
  { value: 'PEDI', label: 'Pediatría' },
  { value: 'GINE', label: 'Ginecología' },
  { value: 'CIRU', label: 'Cirugía' },
  { value: 'TRAU', label: 'Traumatología' },
  { value: 'PSIC', label: 'Psicología' },
  { value: 'NUTR', label: 'Nutrición' },
  { value: 'ODON', label: 'Odontología' },
  { value: 'GENE', label: 'Medicina GENERAL' },
];
