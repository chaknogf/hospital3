/** Etiqueta y código de rol disponibles en la interfaz de administración. */
export interface Values {
  label: string;
  value: string;
}

/** Catálogo para presentación; el backend sigue siendo la autoridad de permisos. */
export const roles: Values[] = [
  { label: 'Usuario', value: 'regular' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Registros', value: 'registro' },
  { label: 'Estadistica', value: 'std' },
  { label: 'UISAU', value: 'uisau' },
  { label: 'Trabajo Social', value: 'ts' },
  { label: 'Medico', value: 'medic' },
  { label: 'Enfermería', value: 'paramedic' },
  { label: 'Laboratorio', value: 'lab' },
  { label: 'Rayos X', value: 'rx' },
  { label: 'Epidemiología', value: 'epi' },
  { label: 'Nutrición', value: 'nutric' },
  { label: 'Odontología', value: 'odonto' },


];
