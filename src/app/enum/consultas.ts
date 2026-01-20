

type EstadoCiclo =
  | "admision"
  | "signos"
  | "consulta"
  | "estudios"
  | "tratamiento"
  | "observacion"
  | "evolucion"
  | "procedimiento"
  | "recuperacion"
  | "egreso"
  | "referido"
  | "traslado"
  | "prestamo"
  | "archivo"
  | "recepcion"
  | "actualizado"
  | "descartado"
  | "reprogramado";


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
