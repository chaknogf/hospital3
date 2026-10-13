// uisau/uisau.model.ts
import { Dict } from '../enum/diccionarios';

/** Estado clínico del paciente (catálogo UISAU, valor numérico). */
export const ESTADOS_UISAU: Dict[] = [
  { label: 'Estable', value: 1 },
  { label: 'Delicado', value: 2 },
  { label: 'Grave', value: 3 },
  { label: 'Crítico', value: 4 },
  { label: 'En recuperación', value: 5 },
  { label: 'De alta', value: 6 },
];

/** Situación / movimiento asistencial del paciente. */
export const SITUACIONES_UISAU: Dict[] = [
  { label: 'Ingreso', value: 1 },
  { label: 'Evolución favorable', value: 2 },
  { label: 'Sin cambios', value: 3 },
  { label: 'Empeoramiento', value: 4 },
  { label: 'Traslado', value: 5 },
  { label: 'Referencia', value: 6 },
  { label: 'Egreso', value: 7 },
];

/** Lugar/institucional al que se refiere o traslada al paciente. */
export const LUGARES_REFERENCIA: Dict[] = [
  { label: 'Ninguno', value: 0 },
  { label: 'Hospital Regional', value: 1 },
  { label: 'Centro de Atención Permanente (CAP)', value: 2 },
  { label: 'Puesto de Salud', value: 3 },
  { label: 'IGSS', value: 4 },
  { label: 'Clínica privada', value: 5 },
  { label: 'Otro', value: 99 },
];

/** Datos de estado clínico y ubicación del paciente (grupo "estado del paciente"). */
export interface UisauEstadoPaciente {
  fecha?: string;
  hora?: string;
  estado?: number | null;
  situacion?: number | null;
  lugar_referencia?: number | null;
  fecha_referencia?: string;
  estadia?: number | null;
  cama?: number | null;
  especialidad?: string;
  servicio?: string;
}

/** Datos de información al usuario y de la persona de contacto. */
export interface UisauInformacionContacto {
  informacion?: string;
  contacto?: string;
  parentesco?: number | null;
  telefono?: number | null;
  fecha_contacto?: string;
  hora_contacto?: string;
}

/** Diagnóstico clínico del registro UISAU. */
export interface UisauDiagnostico {
  codigo: string;
  descripcion: string;
}

/** Artículo o insumo entregado al paciente. */
export interface UisauArticulo {
  descripcion: string;
  cantidad?: number | null;
}

/** Nota clínica del registro UISAU (grupo "nota clínica"). */
export interface UisauNotaClinica {
  nota?: string;
  estudios?: string;
  evolucion?: string;
  receta?: string;
  receta_por?: string;
  diagnosticos?: UisauDiagnostico[];
  articulos?: UisauArticulo[];
}

/**
 * Registro exclusivo del rol UISAU. Se persiste en `ciclos_consulta.uisau` (JSONB)
 * separando la información de estado del paciente, de información/contacto y la
 * nota clínica.
 */
export interface DatosUisau {
  estado_paciente?: UisauEstadoPaciente;
  informacion_contacto?: UisauInformacionContacto;
  nota_clinica?: UisauNotaClinica;
  usuario?: string;
  registro?: string;
}

/** Construye un registro UISAU vacío con la fecha/hora actuales. */
export function crearDatosUisauVacios(): DatosUisau {
  const ahora = new Date();
  return {
    estado_paciente: {
      fecha: ahora.toISOString().substring(0, 10),
      hora: ahora.toTimeString().substring(0, 5),
      estado: null,
      situacion: null,
      lugar_referencia: null,
      fecha_referencia: '',
      estadia: null,
      cama: null,
      especialidad: '',
      servicio: '',
    },
    informacion_contacto: {
      informacion: '',
      contacto: '',
      parentesco: null,
      telefono: null,
      fecha_contacto: '',
      hora_contacto: '',
    },
    nota_clinica: {
      nota: '',
      estudios: '',
      evolucion: '',
      receta: '',
      receta_por: '',
      diagnosticos: [],
      articulos: [],
    },
  };
}
