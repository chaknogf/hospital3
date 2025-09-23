// app/models/consultas.enums.ts

// 🔹 Tipos de consulta posibles
export enum TipoConsulta {
  coex = 1,
  hospitalizacion = 2,
  emergencia = 3,
  interconsulta = 4,
  OTRO = 99
}

// 🔹 Especialidades médicas (ejemplo)
export enum Especialidad {
  PEDIATRIA = 1,
  MEDICINA_GENERAL = 2,
  GINECOLOGIA = 3,
  CIRUGIA = 4,
  CARDIOLOGIA = 5,
  OTRO = 99
}

// 🔹 Servicios disponibles
export enum Servicio {
  CONSULTA_EXTERNA = 1,
  HOSPITALIZACION = 2,
  EMERGENCIA = 3,
  QUIRURGICO = 4,
  OTRO = 99
}

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

export enum Ciclo {
  admision = 1,
  signos_vitales = 2,
  evaluacion_medica = 3,
  diagnostico = 4,
  tratamiento = 5,
  evolucion = 6,
  traslado = 7,
  alta = 8,
  archivo = 9,
  prestamo = 10
}
