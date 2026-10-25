import type { IconService } from '../service/icon.service';

export type ModuleIcon = Parameters<IconService['getIcon']>[0];

export interface ModuleNavItem {
  nombre: string;
  descripcion: string;
  ruta: string;
  icon: ModuleIcon;
}

export interface ModuleNavConfig {
  title: string;
  subtitle: string;
  accent: string;
  items: ModuleNavItem[];
}

export const MEDICA_NAV: ModuleNavConfig = {
  title: 'Consulta Médica',
  subtitle: 'Atención médica: pacientes, notas, historia y quirófano',
  accent: '#34d399',
  items: [
    { nombre: 'Pacientes activos', descripcion: 'Listado por especialidad; registra nota o abre historia', ruta: 'pacientes-activos', icon: 'patientIcon' },
    { nombre: 'Notas médicas', descripcion: 'Selecciona una consulta y registra la evolución clínica', ruta: 'notas-medicas', icon: 'notaMedica' },
    { nombre: 'Historia clínica', descripcion: 'Consulta ciclos, antecedentes y notas del expediente', ruta: 'historia-clinica', icon: 'historiaMedicaIcon' },
    { nombre: 'Quirófano', descripcion: 'Intervenciones quirúrgicas y pacientes hospitalizados', ruta: 'quirofano', icon: 'ciruIcon' },
    { nombre: 'Resumen Quirófano', descripcion: 'Estadísticas del área quirúrgica', ruta: 'quirofano-resumen', icon: 'ciruIcon' },
  ],
};

export const REPORTES_NAV: ModuleNavConfig = {
  title: 'Reportes',
  subtitle: 'Reportes y estadísticas del hospital',
  accent: '#22d3ee',
  items: [
    { nombre: 'Índice', descripcion: 'Todos los reportes disponibles', ruta: '', icon: 'datosIcon' },
    { nombre: 'Pacientes atendidos', descripcion: 'Por tipo consulta, especialidad y sexo', ruta: 'pacientes-atendidos', icon: 'consultasIcon' },
    { nombre: 'Hospitalización infantil', descripcion: '>28 días y <5 años por especialidad', ruta: 'hospitalizacion-infantil', icon: 'babyIcon' },
    { nombre: 'Promedio diario', descripcion: 'Promedio de consultas por especialidad', ruta: 'promedio-diario', icon: 'calendarIcon' },
    { nombre: 'Personal del hospital', descripcion: 'Consultas de personal del hospital', ruta: 'personal-hospital', icon: 'doctorIcon' },
    { nombre: 'Estudiantes públicos', descripcion: 'Consultas de estudiantes públicos', ruta: 'estudiante-publico', icon: 'patientIcon' },
    { nombre: 'Reingresos', descripcion: 'Reingresos hospitalarios con clasificación', ruta: 'reingresos', icon: 'ingresoIcon' },
    { nombre: 'Reingresos tipo 3', descripcion: 'Listado de reingresos tipo 3', ruta: 'reingresos-tipo3', icon: 'archivoIcon' },
    { nombre: 'Activos >7 días', descripcion: 'Consultas activas mayores a 7 días', ruta: 'activos-mayores-7-dias', icon: 'enfermoIcon' },
    { nombre: 'Nacimientos', descripcion: 'Estadísticas de nacimientos', ruta: 'estadisticas-nacimientos', icon: 'compartirIcon' },
    { nombre: 'Procedimientos', descripcion: 'Reporte por especialidad, servicio, sexo y resumen', ruta: 'procedimientos', icon: 'datosIcon' },
    { nombre: 'SIGSA-3 por especialidad', descripcion: 'Consultas por especialidad, tipo y sexo', ruta: 'sigsa3-estadistica', icon: 'consultasIcon' },
    { nombre: 'SIGSA-3 Dx frecuentes', descripcion: 'Top 10 diagnósticos más frecuentes', ruta: 'sigsa3-dx-frecuentes', icon: 'datosIcon' },
    { nombre: 'Diagnósticos CIE-10 Z', descripcion: 'Filtrar por códigos Z:34 y Z:10', ruta: 'dx-z-cie10', icon: 'archivoIcon' },
    { nombre: 'Indicadores consultas', descripcion: 'Banderas del jsonb indicadores por período', ruta: 'indicadores-consultas', icon: 'datosIcon' },
    { nombre: 'Referencias consultas', descripcion: 'Viene referido de / va referido a', ruta: 'referencias-consultas', icon: 'compartirIcon' },
  ],
};

export const NUTRICION_NAV: ModuleNavConfig = {
  title: 'Nutrición',
  subtitle: 'Consulta externa, citas y reportes de nutrición',
  accent: '#fbbf24',
  items: [
    { nombre: 'Pacientes', descripcion: 'Pacientes y consultas', ruta: 'consultar', icon: 'persons2' },
    { nombre: 'COEX', descripcion: 'Consulta Externa de Nutrición', ruta: 'coex', icon: 'consultaMedica' },
    { nombre: 'Notas médicas', descripcion: 'Selecciona una consulta y registra la evolución clínica', ruta: 'notas-medicas', icon: 'notaMedica' },
    { nombre: 'Historia clínica', descripcion: 'Consulta ciclos, antecedentes y notas del expediente', ruta: 'historia-clinica', icon: 'historiaMedicaIcon' },
    { nombre: 'Citas', descripcion: 'Agendar y consultar citas', ruta: 'citas', icon: 'calendarIcon' },
    { nombre: 'Reportes', descripcion: 'Reportes y estadísticas detalladas', ruta: 'reportes', icon: 'archivoIcon' },
  ],
};

export const ODONTOLOGIA_NAV: ModuleNavConfig = {
  title: 'Odontología',
  subtitle: 'Consulta externa, citas y reportes de odontología',
  accent: '#f472b6',
  items: [
    { nombre: 'Pacientes', descripcion: 'Pacientes y consultas', ruta: 'consultar', icon: 'persons2' },
    { nombre: 'COEX', descripcion: 'Consulta Externa de Odontología', ruta: 'coex', icon: 'consultaMedica' },
    { nombre: 'Notas médicas', descripcion: 'Selecciona una consulta y registra la evolución clínica', ruta: 'notas-medicas', icon: 'notaMedica' },
    { nombre: 'Historia clínica', descripcion: 'Consulta ciclos, antecedentes y notas del expediente', ruta: 'historia-clinica', icon: 'historiaMedicaIcon' },
    { nombre: 'Citas', descripcion: 'Agendar y consultar citas', ruta: 'citas', icon: 'calendarIcon' },
    { nombre: 'Reportes', descripcion: 'Reportes y estadísticas detalladas', ruta: 'reportes', icon: 'archivoIcon' },
  ],
};

export const REGISTROS_NAV: ModuleNavConfig = {
  title: 'Registros Médicos',
  subtitle: 'Gestión de pacientes, consultas y expedientes clínicos',
  accent: '#3b82f6',
  items: [
    { nombre: 'Pacientes', descripcion: 'Pacientes registrados', ruta: 'pacientes', icon: 'persons2' },
    { nombre: 'Consultas', descripcion: 'Todas las consultas registradas', ruta: 'consultas', icon: 'consultasIcon' },
    { nombre: 'Emergencia', descripcion: 'Emergencias registradas', ruta: 'emergencias', icon: 'ambulanceIcon' },
    { nombre: 'Coex', descripcion: 'Consultas externas registradas', ruta: 'coex', icon: 'consultaMedica' },
    { nombre: 'Ingresos', descripcion: 'Hospitalizaciones registradas', ruta: 'ingresos', icon: 'ingresoIcon' },
    { nombre: 'Recepción', descripcion: 'Gestión de expedientes', ruta: 'recepcion', icon: 'archivoIcon' },
    { nombre: 'Préstamo', descripcion: 'Gestor de expedientes prestados', ruta: 'prestamos', icon: 'compartirIcon' },
    { nombre: 'Expedientes', descripcion: 'Expedientes con/sin consulta reciente', ruta: 'expedientes', icon: 'archivoIcon' },
    { nombre: 'Activos >7 días', descripcion: 'Consultas activas mayores a 7 días', ruta: 'activos-mayores-7-dias', icon: 'enfermoIcon' },
    { nombre: 'Citas', descripcion: 'Gestor de citas', ruta: 'citas', icon: 'calendarIcon' },
    { nombre: 'Nacimientos', descripcion: 'Constancias de nacimiento', ruta: 'nacimientos', icon: 'babyIcon' },
    { nombre: 'Defunciones', descripcion: 'Informe de defunción formato oficial', ruta: 'defunciones', icon: 'defuncionIcon' },
    { nombre: 'Personal de Salud', descripcion: 'Médicos, Especialistas y otro personal', ruta: 'doctores', icon: 'doctorIcon' },
  ],
};

export const ESTADISTICA_NAV: ModuleNavConfig = {
  title: 'Estadística',
  subtitle: 'Reportes, censo de camas y datos estadísticos',
  accent: '#22d3ee',
  items: [
    { nombre: 'Pacientes', descripcion: 'Pacientes y consultas', ruta: 'consultar', icon: 'persons2' },
    { nombre: 'Préstamo', descripcion: 'Gestor de expedientes prestados', ruta: 'prestamos', icon: 'compartirIcon' },
    { nombre: 'Procedimientos', descripcion: 'Procedimientos menores y mayores', ruta: 'procedimientos', icon: 'datosIcon' },
    { nombre: 'Censo de Camas', descripcion: 'Censo diario de camas', ruta: 'censo-camas', icon: 'censoCamasIcon' },
    { nombre: 'Reportes', descripcion: 'Reportes y estadísticas detalladas', ruta: 'reportes', icon: 'archivoIcon' },
    { nombre: 'Resumen Quirófano', descripcion: 'Estadísticas del área quirúrgica', ruta: 'quirofano-resumen', icon: 'ciruIcon' },
    { nombre: 'Personal Hospital', descripcion: 'Personal del hospital registrado', ruta: 'personal-hospital', icon: 'doctorIcon' },
    { nombre: 'Nacimientos', descripcion: 'Registro de nacimientos', ruta: 'nacimientos', icon: 'babyIcon' },
    { nombre: 'Médicos', descripcion: 'Médicos registrados', ruta: 'doctores', icon: 'doctorIcon' },
    { nombre: 'SIGSA-3', descripcion: 'Registros SIGSA-3 e importación CSV', ruta: 'sigsa3', icon: 'consultasIcon' },
    { nombre: 'SIGSA-3 Registros', descripcion: 'Registros SIGSA-3 normalizados', ruta: 'sigsa3-registros', icon: 'documentoIcon' },
    { nombre: 'Agente', descripcion: 'Chat inteligente de datos (NL→SQL)', ruta: 'agente', icon: 'compartirIcon' },
  ],
};

export const TRABAJO_SOCIAL_NAV: ModuleNavConfig = {
  title: 'Trabajo Social',
  subtitle: 'Gestión social: casos, nacimientos y reportes',
  accent: '#e879f9',
  items: [
    { nombre: 'Pacientes', descripcion: 'Pacientes y consultas', ruta: 'consultar', icon: 'persons2' },
    { nombre: 'Nacimientos', descripcion: 'Registro de nacimientos (solo lectura)', ruta: 'nacimientos', icon: 'babyIcon' },
    { nombre: 'Reportes', descripcion: 'Reportes y estadísticas detalladas', ruta: 'reportes', icon: 'archivoIcon' },
  ],
};

export const UISAU_NAV: ModuleNavConfig = {
  title: 'UISAU',
  subtitle: 'Unidad de Información en Salud al Usuario',
  accent: '#818cf8',
  items: [
    { nombre: 'Pacientes', descripcion: 'Buscar pacientes y gestionar notas', ruta: 'consultar', icon: 'persons2' },
    { nombre: 'Lista', descripcion: 'Pacientes por servicio: COEX, hospitalización y emergencia', ruta: 'lista', icon: 'ambulanceIcon' },
    { nombre: 'Nota', descripcion: 'Registrar nota y consultar la historia UISAU', ruta: 'nota', icon: 'documentoIcon' },
    { nombre: 'Estadísticas', descripcion: 'Reportes y estadísticas detalladas', ruta: 'reportes', icon: 'archivoIcon' },
  ],
};

export const ENFERMERIA_NAV: ModuleNavConfig = {
  title: 'Enfermería',
  subtitle: 'Gestión de paramédica',
  accent: '#818cf8',
  items: [
    {
      nombre: 'Pacientes activos', descripcion: 'Listado por especialidad; registra nota o abre historia', ruta: 'pacientes-activos', icon: 'patientIcon'
    },
    {
      nombre: 'Notas médicas',
      descripcion: 'Selecciona una consulta y registra la evolución clínica',
      ruta: 'notas-medicas',
      icon: 'notaMedica',
    },
    {
      nombre: 'Historia clínica',
      descripcion: 'Consulta ciclos, antecedentes y notas del expediente',
      ruta: 'historia-clinica',
      icon: 'historiaMedicaIcon',
    },
    {
      nombre: 'Quirófano',
      descripcion: 'Intervenciones quirúrgicas y pacientes hospitalizados',
      ruta: 'quirofano',
      icon: 'ciruIcon',
    },
    {
      nombre: 'Resumen Quirófano',
      descripcion: 'Estadísticas del área quirúrgica',
      ruta: 'quirofano-resumen',
      icon: 'ciruIcon',
    },
    {
      nombre: 'Censo de Camas',
      descripcion: 'Gestión y registro del censo diario de camas',
      ruta: 'censo-camas',
      icon: 'censoCamasIcon',
    },
    {
      nombre: 'Medicamentos',
      descripcion: 'Gestión de inventario y administración de medicamentos',
      ruta: 'medicamentos',
      icon: 'medicinaIcon',
    },
    {
      nombre: 'Reportes',
      descripcion: 'Reportes y estadísticas detalladas',
      ruta: 'reportes',
      icon: 'archivoIcon',
    },
  ],
};
