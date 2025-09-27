/////////////////////////
// Interfaces Base
/////////////////////////
export interface Dict {
  label: string;
  value: any;
  ref?: string;
}



/////////////////////////
// Basados en SIGSA
/////////////////////////

export const estadoCivil: Dict[] = [
  { label: 'Casado', value: 1 },
  { label: 'Unido', value: 2 },
  { label: 'Soltero', value: 3 },
  { label: 'Viudo', value: 4 },

]

export const tipoConsulta: Dict[] = [
  { label: 'COEX', value: 1 },
  { label: 'HOSPITALIZACIÓN', value: 2 },
  { label: 'EMERGENCIA', value: 3 },
  { label: 'INTERCONSULTA', value: 4 },
  { label: 'OTRO', value: 99 },
];

export const idiomas: Dict[] = [
  { label: 'Achi', value: 1 },
  { label: 'Akateka', value: 2 },
  { label: 'Awakateka', value: 3 },
  { label: 'Chalchiteka', value: 4 },
  { label: 'Chorti', value: 5 },
  { label: 'Chuj', value: 6 },
  { label: 'Español', value: 7 },
  { label: 'Itza', value: 8 },
  { label: 'Ixil', value: 9 },
  { label: 'Jakalteka', value: 10 },
  { label: 'Kaqchikel', value: 11 },
  { label: 'Kiche', value: 12 },
  { label: 'Mam', value: 13 },
  { label: 'Mopan', value: 14 },
  { label: 'No indica', value: 15 },
  { label: 'Otro', value: 16 },
  { label: 'Pocomchi', value: 17 },
  { label: 'Poqomam', value: 18 },
  { label: 'Qanjobal', value: 19 },
  { label: 'Qeqchi', value: 20 },
  { label: 'Sakapulteka', value: 21 },
  { label: 'Sipakapensa', value: 22 },
  { label: 'Tektiteka', value: 23 },
  { label: 'Tzutujil', value: 24 },
  { label: 'Uspanteka', value: 25 },
];

export const pueblos: Dict[] = [
  { label: 'Ladino', value: 1 },
  { label: 'Maya', value: 2 },
  { label: 'Garífuna', value: 3 },
  { label: 'Xinca', value: 4 },
  { label: 'Otros', value: 5 },
  { label: 'No indica', value: 6 },
];


/////////////////////////
// Otros
/////////////////////////


export const partos: Dict[] = [
  { label: 'Parto Vaginal', value: 'PES' },
  { label: 'Parto Cesárea', value: 'CSTP' },
]

export const parentescos: Dict[] = [
  { label: 'Madre/Padre', value: 1 },
  { label: 'Hijo/a', value: 2 },
  { label: 'Hermano/a', value: 3 },
  { label: 'Abuelo/a', value: 4 },
  { label: 'Tío/a', value: 5 },
  { label: 'Primo/a', value: 6 },
  { label: 'Sobrino/a', value: 7 },
  { label: 'Yerno/Nuera', value: 8 },
  { label: 'Esposo/a', value: 9 },
  { label: 'Suegro/a', value: 10 },
  { label: 'Tutor', value: 11 },
  { label: 'Amistad', value: 12 },
  { label: 'Novio/a', value: 13 },
  { label: 'Cuñado/a', value: 14 },
  { label: 'Nieto/a', value: 15 },
  { label: 'Hijastros', value: 16 },
  { label: 'Padrastros', value: 17 },
  { label: 'Otro', value: 18 },
];

export const gradoAcademicos: Dict[] = [
  { label: 'No aplica', value: 1 },
  { label: 'Pre Primaria', value: 2 },
  { label: 'Primaria', value: 3 },
  { label: 'Básicos', value: 4 },
  { label: 'Diversificado', value: 5 },
  { label: 'Universidad', value: 6 },
  { label: 'Ninguno', value: 7 },
  { label: 'Otro', value: 8 },
  { label: 'No indica', value: 9 },
]

export const ciclos: Dict[] = [
  { label: 'Admision', value: 'ADMI', ref: 'activo' },
  { label: 'Actualizacion', value: 'ACTU', ref: 'none' },
  { label: 'Signos Vitales', value: 'SVIT', ref: 'activo' },
  { label: 'Emergencia', value: 'EMER', ref: 'activo' },
  { label: 'Atencion Medica', value: 'ATME', ref: 'activo' },
  { label: 'Diagnostico', value: 'DIAG', ref: 'activo' },
  { label: 'Tratamiento', value: 'TRAT', ref: 'activo' },
  { label: 'Traslado', value: 'TRAS', ref: 'activo' },
  { label: 'Quirofano', value: 'QUIR', ref: 'activo' },
  { label: 'Egreso', value: 'EGRE', ref: 'inactivo' },
  { label: 'Archivo', value: 'ARCH', ref: 'inactivo' },
  { label: 'Prestamo', value: 'PRES', ref: 'inactivo' },
  { label: 'Registros', value: 'REGI', ref: 'none' },
  { label: 'Interconsulta', value: 'INCO', ref: 'activo' },
];

export const especialidades: Dict[] = [
  { label: 'Pediatria', value: 'PEDI', ref: 'all' },
  { label: 'Medicina Interna', value: 'MEDI', ref: 'all' }, // combinación para diferenciar
  { label: 'Ginecologia', value: 'GINE', ref: 'all' },
  { label: 'Cirugia', value: 'CIRU', ref: 'all' },
  { label: 'Traumatologia', value: 'TRAU', ref: 'all' },
  { label: 'Odontología', value: 'ODON', ref: 'coex' },
  { label: 'Psicología', value: 'PSIC', ref: 'coex' },
  { label: 'Nutricion', value: 'NUTR', ref: 'coex' },
  { label: 'Anestesia', value: 'ANES', ref: 'sop' },
];


export const servicios: Dict[] = [
  { label: 'Consulta Externa', value: 'COEX', ref: 'coex' },
  { label: 'Hospitalizacion', value: 'HOSP', ref: 'ingresos' },
  { label: 'Emergencia', value: 'EMER', ref: 'emergencia' },
  { label: 'Sala de Operaciones', value: 'SOPR', ref: 'sop' }, // SOP ya está en ref, mejor SOPR
  { label: 'Pediatría Emergencia', value: 'PEDI', ref: 'emergencia' },
  { label: 'Ginecología Emergencia', value: 'GINE', ref: 'emergencia' },
  { label: 'Medicina Interna Emergencia', value: 'MEDI', ref: 'emergencia' },
  { label: 'Cirugia Emergencia', value: 'CIRU', ref: 'emergencia' },
  { label: 'Traumatologia Emergencia', value: 'TRAU', ref: 'emergencia' },
  { label: 'Area Roja', value: 'AROJ', ref: 'emergencia' },
  { label: 'Medicina Hombre', value: 'MEHO', ref: 'ingreso' },
  { label: 'Medicina Mujer', value: 'MEMU', ref: 'ingreso' },
  { label: 'Cirugía Hombre', value: 'CIHO', ref: 'ingreso' },
  { label: 'Cirugía Mujer', value: 'CIMU', ref: 'ingreso' },
  { label: 'Trauma Hombre', value: 'TRHO', ref: 'ingreso' },
  { label: 'Trauma Mujer', value: 'TRMU', ref: 'ingreso' },
  { label: 'Ginecoligía', value: 'GINI', ref: 'ingreso' }, // para diferenciar de GINE
  { label: 'Maternidad', value: 'MATE', ref: 'ingreso' },
  { label: 'Pediatria', value: 'PEDA', ref: 'ingreso' }, // PEDI ya existe, cambio a PEDA
  { label: 'Neonatal', value: 'NEON', ref: 'ingreso' },
  { label: 'CRN', value: 'CRN_', ref: 'ingreso' }, // 3 letras, le añado "_" para 4 chars
  { label: 'UCIN', value: 'UCIN', ref: 'ingreso' },
  { label: 'UCIA', value: 'UCIA', ref: 'ingreso' },
  { label: 'Terapia Respiratoria', value: 'TERA', ref: 'apoyo' },
  { label: 'Trabajo Social', value: 'TSOC', ref: 'apoyo' },
  { label: 'Psicologia', value: 'PSIC', ref: 'apoyo' },
  { label: 'Nutricion', value: 'NUTR', ref: 'apoyo' },
  { label: 'Enfermería', value: 'ENFE', ref: 'apoyo' },
  { label: 'Otro', value: 'OTRO', ref: 'apoyo' },
  { label: 'Rayos X', value: 'RAYX', ref: 'apoyo' },
  { label: 'Laboratorio', value: 'LABO', ref: 'apoyo' },
  { label: 'Registros Medicos', value: 'REME', ref: 'apoyo' },
];



