
// app/models/consultas.enums.ts
export interface Dictionary {
  label: string;
  value: any;
}

export interface DictionaryServicios {
  label: string;
  value: string;
  ref: string;
}


export const tipoConsulta: Dictionary[] = [
  { label: 'COEX', value: '1' },
  { label: 'HOSPITALIZACIÓN', value: '2' },
  { label: 'EMERGENCIA', value: '3' },
  { label: 'INTERCONSULTA', value: '4' },
  { label: 'OTRO', value: '99' },
];

export const ciclos: Dictionary[] = [
  { label: 'Admision', value: '1' },
  { label: 'Signos Vitales', value: '2' },
  { label: 'Emergencia', value: '3' },
  { label: 'Atencion Medica', value: '4' },
  { label: 'Diagnostico', value: '5' },
  { label: 'Tratamiento', value: '6' },
  { label: 'Traslado', value: '7' },
  { label: 'Egreso', value: '8' },
  { label: 'Archivo', value: '9' },
  { label: 'Prestamo', value: '10' },
  { label: 'Registros', value: '11' },
  { label: 'Interconsulta', value: '12' },
  { label: 'Actualizacion', value: '13' },
]

export const especialidades: DictionaryServicios[] = [
  { label: 'Pediatria', value: '1', ref: 'all' },
  { label: 'Medicina General', value: '2', ref: 'all' },
  { label: 'Ginecologia', value: '3', ref: 'all' },
  { label: 'Cirugia', value: '4', ref: 'all' },
  { label: 'Traumatologia', value: '5', ref: 'all' },
  { label: 'Odontología', value: '6', ref: 'coex' },
  { label: 'Psicología', value: '7', ref: 'coex' },
  { label: 'Nutricion', value: '8', ref: 'coex' },
  { label: 'Anestesia', value: '9', ref: 'sop' },
]


export const servicios: DictionaryServicios[] = [
  { label: 'Consulta Externa', value: '1', ref: 'coex' },
  { label: 'Hospitalizacion', value: '2', ref: 'ingresos' },
  { label: 'Emergencia', value: '3', ref: 'emergencia' },
  { label: 'Sala de Operaciones', value: '4', ref: 'sop' },
  { label: 'Pediatría', value: '5', ref: 'emergencia' },
  { label: 'Ginecología', value: '6', ref: 'emergencia' },
  { label: 'Medicina Interna', value: '7', ref: 'emergencia' },
  { label: 'Cirugia', value: '8', ref: 'emergencia' },
  { label: 'Tramatologia', value: '9', ref: 'emergencia' },
  { label: 'Area Roja', value: '10', ref: 'emergencia' },
  { label: 'Medicina Hombre', value: '11', ref: 'ingreso' },
  { label: 'Medicina Mujer', value: '12', ref: 'ingreso' },
  { label: 'Cirugía Hombre', value: '13', ref: 'ingreso' },
  { label: 'Cirugía Mujer', value: '14', ref: 'ingreso' },
  { label: 'Trauma Hombre', value: '15', ref: 'ingreso' },
  { label: 'Trauma Mujer', value: '16', ref: 'ingreso' },
  { label: 'Ginecoligía', value: '17', ref: 'ingreso' },
  { label: 'Maternidad', value: '18', ref: 'ingreso' },
  { label: 'Pediatria', value: '19', ref: 'ingreso' },
  { label: 'Neonatal', value: '20', ref: 'ingreso' },
  { label: 'CRN', value: '21', ref: 'ingreso' },
  { label: 'UCIN', value: '22', ref: 'ingreso' },
  { label: 'UCIA', value: '23', ref: 'ingreso' },
  { label: 'Terapia Respiratoria', value: '24', ref: 'apoyo' },
  { label: 'Trabajo Social', value: '25', ref: 'apoyo' },
  { label: 'Psicologia', value: '26', ref: 'apoyo' },
  { label: 'Nutricion', value: '27', ref: 'apoyo' },
  { label: 'Enfermería', value: '28', ref: 'apoyo' },
  { label: 'Otro', value: '28', ref: 'apoyo' },
  { label: 'Rayos X', value: '29', ref: 'apoyo' },
  { label: 'Laboratorio', value: '30', ref: 'apoyo' },
  { label: 'Registros Medicos', value: '31', ref: 'apoyo' },
]





// 🔹 Campos clínicos para referencias rápidas
export enum CamposClinicos {
  CICLO = 'ciclo',
  INDICADORES = 'indicadores',
  DETALLE_CLINICO = 'detalle_clinico',
  SISTEMA = 'sistema',
  SIGNOS_VITALES = 'signos_vitales',
  ANTECEDENTES = 'antecedentes',
  ORDENES = 'ordenes',
  ESTUDIOS = 'estudios',
  COMENTARIO = 'comentario',
  IMPRESION_CLINICA = 'impresion_clinica',
  TRATAMIENTO = 'tratamiento',
  EXAMEN_FISICO = 'examen_fisico',
  NOTA_ENFERMERIA = 'nota_enfermeria',
  CONTRAINDICADO = 'contraindicado',
  PRESA_QUIRURGICA = 'presa_quirurgica',
  EGRESO = 'egreso'
}
