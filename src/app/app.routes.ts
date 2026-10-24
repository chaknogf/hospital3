import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { roleGuard } from './role.guard';
import {
  ESTADISTICA_NAV,
  MEDICA_NAV,
  NUTRICION_NAV,
  REPORTES_NAV,
  ODONTOLOGIA_NAV,
  REGISTROS_NAV,
  TRABAJO_SOCIAL_NAV,
  UISAU_NAV,
} from './shared/module-nav';

/** Rutas de la aplicación; el guard de sesión agrupa las vistas autenticadas. */
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () => import('./principal/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'resetpass',
    loadComponent: () => import('./principal/administrador/recuperar/recuperar.component').then(c => c.RecuperarComponent)
  },

  // ── Rutas protegidas agrupadas ──
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dash',
        loadComponent: () => import('./principal/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      //admin
      {
        path: 'adminsys',
        loadComponent: () => import('./principal/administrador/admin/admin.component').then(c => c.AdminComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./principal/administrador/usuarios/usuarios.component').then(c => c.UsuariosComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuario/:id',
        loadComponent: () => import('./principal/administrador/usuario/usuario.component').then(c => c.UsuarioComponent)
      },
      {
        path: 'newuser',
        loadComponent: () => import('./principal/administrador/registrar/registrar.component').then(c => c.RegistrarComponent)
      },
      {
        path: 'merge-pacientes',
        loadComponent: () => import('./principal/administrador/merge-pacientes/merge-pacientes.component').then(c => c.MergePacientesComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'duplicados-pacientes',
        loadComponent: () => import('./principal/administrador/duplicados-pacientes/duplicados-pacientes.component').then(c => c.DuplicadosPacientesComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-municipios',
        loadComponent: () => import('./principal/administrador/gestion-municipios/gestion-municipios.component').then(c => c.GestionMunicipiosComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-encamamiento',
        loadComponent: () => import('./principal/administrador/gestion-encamamiento/gestion-encamamiento.component').then(c => c.GestionEncamamientoComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-audit-log',
        loadComponent: () => import('./principal/administrador/gestion-audit-log/gestion-audit-log.component').then(c => c.GestionAuditLogComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-especialidades',
        loadComponent: () => import('./principal/administrador/gestion-especialidades/gestion-especialidades.component').then(c => c.GestionEspecialidadesComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-dias-inhabiles',
        loadComponent: () => import('./principal/administrador/gestion-dias-inhabiles/gestion-dias-inhabiles.component').then(c => c.GestionDiasInhabilesComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'gestion-procedimientos',
        loadComponent: () => import('./principal/administrador/gestion-procedimientos/gestion-procedimientos.component').then(c => c.GestionProcedimientosComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'desactivar-consulta',
        loadComponent: () => import('./principal/administrador/desactivar-consulta/desactivar-consulta.component').then(c => c.DesactivarConsultaComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'eliminar-consulta',
        loadComponent: () => import('./principal/administrador/eliminar-consulta/eliminar-consulta.component').then(c => c.EliminarConsultaComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'eliminar-constancia',
        loadComponent: () => import('./principal/administrador/eliminar-constancia/eliminar-constancia.component').then(c => c.EliminarConstanciaComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'consultas/:consultaId/reasignar-paciente',
        loadComponent: () => import('./principal/administrador/reasignar-paciente/reasignar-paciente.component').then(c => c.ReasignarPacienteComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'eliminar-paciente',
        loadComponent: () => import('./principal/administrador/eliminar-paciente/eliminar-paciente.component').then(c => c.EliminarPacienteComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'limpiar-cui-paciente',
        loadComponent: () => import('./principal/administrador/limpiar-cui/limpiar-cui.component').then(c => c.LimpiarCuiComponent),
        canActivate: [roleGuard(['admin'])]
      },

      // Registros Médicos — barra lateral con rutas hijas
      {
        path: 'registros',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])],
        data: { module: REGISTROS_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'pacientes' },
          {
            path: 'pacientes',
            loadComponent: () => import('./registros/patient/pacientes/pacientes.component').then(c => c.PacientesComponent)
          },
          {
            path: 'consultas',
            loadComponent: () => import('./registros/consultas/consultas/consultas.component').then(c => c.ConsultasComponent)
          },
          {
            path: 'emergencias',
            loadComponent: () => import('./registros/consultas/emergencias/emergenciasList/emergenciasList.component').then(c => c.EmergenciasListComponent)
          },
          {
            path: 'coex',
            loadComponent: () => import('./registros/consultas/coex/coexLista/coexLista.component').then(c => c.CoexListaComponent)
          },
          {
            path: 'ingresos',
            loadComponent: () => import('./registros/consultas/hospitalizacion/ingresos/ingresos.component').then(c => c.IngresosComponent)
          },
          {
            path: 'recepcion',
            loadComponent: () => import('./registros/consultas/recepcion/recepcion.component').then(c => c.RecepcionComponent)
          },
          {
            path: 'prestamos',
            loadComponent: () => import('./registros/prestamos/listarPrestamos/listarPrestamos.component').then(c => c.ListarPrestamosComponent)
          },
          {
            path: 'expedientes',
            loadComponent: () => import('./registros/patient/expedientes/expedientes.component').then(c => c.ExpedientesComponent)
          },
          {
            path: 'activos-mayores-7-dias',
            loadComponent: () => import('./std/reportes/activos-mayores-7-dias/activos-mayores-7-dias.component').then(c => c.ActivosMayores7DiasComponent)
          },
          {
            path: 'citas',
            loadComponent: () => import('./registros/citas/citados/citados.component').then(c => c.CitadosComponent)
          },
          {
            path: 'nacimientos',
            loadComponent: () => import('./registros/nacimientos/listarConstancias/listarConstancias.component').then(c => c.ListarConstanciasComponent)
          },
          {
            path: 'defunciones',
            loadComponent: () => import('./registros/defunciones/listarDefunciones/listarDefunciones.component').then(c => c.ListarDefuncionesComponent)
          },
          {
            path: 'doctores',
            loadComponent: () => import('./std/personal_atencion/doctores/doctores.component').then(c => c.DoctoresComponent)
          },
          {
            path: 'paciente',
            loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent)
          },
          {
            path: 'paciente/:modo',
            loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent)
          },
          {
            path: 'pacienteEdit/:id',
            loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent)
          },
          {
            path: 'detallePaciente/:id',
            loadComponent: () => import('./registros/patient/detallePaciente/detallePaciente.component').then(c => c.DetallePacienteComponent)
          },
          {
            path: 'hijo/:id',
            loadComponent: () => import('./registros/patient/hijos/hijos.component').then(c => c.HijosComponent)
          },
          {
            path: 'renap',
            loadComponent: () => import('./registros/patient/renap/renap.component').then(c => c.RenapComponent)
          },
          {
            path: 'agendar',
            loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
          },
          {
            path: 'agendar/paciente/:pacienteId',
            loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
          },
          {
            path: 'reagendar/cita/:citaId',
            loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
          },
          {
            path: 'admision',
            loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent)
          },
          {
            path: 'admision/:origen',
            loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent)
          },
          {
            path: 'admisionPaciente/:origen/:pacienteId',
            loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent)
          },
          {
            path: 'editarAdmision/:id/:origen',
            loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent)
          },
          {
            path: 'editarAdmision/:id',
            loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent)
          },
          {
            path: 'detalleAdmision/:id',
            loadComponent: () => import('./registros/adminsion/detalleConsulta/detalleConsulta.component').then(c => c.DetalleConsultaComponent)
          },
          {
            path: 'coexHoja/:id',
            loadComponent: () => import('./registros/consultas/coex/HojaCoex/HojaCoex.component').then(c => c.HojaCoexComponent)
          },
          {
            path: 'hojaPsico/:id',
            loadComponent: () => import('./registros/consultas/coex/HojaCoexPsico/HojaCoexPsico.component').then(c => c.HojaCoexPsicoComponent)
          },
          {
            path: 'hojaOdonto/:id',
            loadComponent: () => import('./registros/consultas/coex/HojaCoexOdonto/HojaCoexOdonto.component').then(c => c.HojaCoexOdontoComponent)
          },
          {
            path: 'hojaEmergencia/:id',
            loadComponent: () => import('./registros/consultas/emergencias/hoja/hoja.component').then(c => c.HojaComponent)
          },
          {
            path: 'ingreso/:id',
            loadComponent: () => import('./registros/consultas/hospitalizacion/hojaIngreso/hojaIngreso.component').then(c => c.HojaIngresoComponent)
          },
          {
            path: 'prestamo/:id',
            loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent)
          },
          {
            path: 'editarPrestamo/:id',
            loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent)
          }
        ]
      },
      {
        path: 'admision',
        loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'admision/:origen',
        loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'admisionPaciente/:origen/:pacienteId',
        loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'editarAdmision/:id/:origen',
        loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'editarAdmision/:id',
        loadComponent: () => import('./registros/adminsion/admision/admision.component').then(c => c.AdmisionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'detalleAdmision/:id',
        loadComponent: () => import('./registros/adminsion/detalleConsulta/detalleConsulta.component').then(c => c.DetalleConsultaComponent)
      },

      {
        path: 'hijo/:id',
        loadComponent: () => import('./registros/patient/hijos/hijos.component').then(c => c.HijosComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },

      // Pacientes
      {
        path: 'pacientes',
        loadComponent: () => import('./registros/patient/pacientes/pacientes.component').then(c => c.PacientesComponent)
      },
      {
        path: 'paciente',
        loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std', 'uisau'])]
      },
      {
        path: 'paciente/:modo',
        loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'detallePaciente/:id',
        loadComponent: () => import('./registros/patient/detallePaciente/detallePaciente.component').then(c => c.DetallePacienteComponent)
      },
      {
        path: 'pacienteEdit/:id',
        loadComponent: () => import('./registros/patient/formularioPaciente/formularioPaciente.component').then(c => c.FormularioPacienteComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'expedientes',
        loadComponent: () => import('./registros/patient/expedientes/expedientes.component').then(c => c.ExpedientesComponent),
      },
      // Emergencias
      {
        path: 'emergencias',
        loadComponent: () => import('./registros/consultas/emergencias/emergenciasList/emergenciasList.component').then(c => c.EmergenciasListComponent)
      },
      {
        path: 'hojaEmergencia/:id',
        loadComponent: () => import('./registros/consultas/emergencias/hoja/hoja.component').then(c => c.HojaComponent)
      },
      // Consulta externa
      {
        path: 'coex',
        loadComponent: () => import('./registros/consultas/coex/coexLista/coexLista.component').then(c => c.CoexListaComponent)
      },
      {
        path: 'coexHoja/:id',
        loadComponent: () => import('./registros/consultas/coex/HojaCoex/HojaCoex.component').then(c => c.HojaCoexComponent)
      },
      {
        path: 'hojaPsico/:id',
        loadComponent: () => import('./registros/consultas/coex/HojaCoexPsico/HojaCoexPsico.component').then(c => c.HojaCoexPsicoComponent)
      },
      {
        path: 'hojaOdonto/:id',
        loadComponent: () => import('./registros/consultas/coex/HojaCoexOdonto/HojaCoexOdonto.component').then(c => c.HojaCoexOdontoComponent)
      },
      {
        path: 'imprimircoex',
        loadComponent: () => import('./registros/consultas/coex/imprimirCoex/imprimirCoex.component').then(c => c.ImprimirCoexComponent)
      },
      // Hospitalización
      {
        path: 'ingresos',
        loadComponent: () => import('./registros/consultas/hospitalizacion/ingresos/ingresos.component').then(c => c.IngresosComponent)
      },
      {
        path: 'ingreso/:id',
        loadComponent: () => import('./registros/consultas/hospitalizacion/hojaIngreso/hojaIngreso.component').then(c => c.HojaIngresoComponent)
      },
      // Consultas
      {
        path: 'consultas',
        loadComponent: () => import('./registros/consultas/consultas/consultas.component').then(c => c.ConsultasComponent)
      },
      {
        path: 'recepcion',
        loadComponent: () => import('./registros/consultas/recepcion/recepcion.component').then(c => c.RecepcionComponent)
      },
      {
        path: 'registro',
        loadComponent: () => import('./registros/adminsion/formConsulta/formConsulta.component').then(c => c.FormConsultaComponent)
      },
      {
        path: 'detalleConsulta/:id',
        loadComponent: () => import('./registros/adminsion/detalleConsulta/detalleConsulta.component').then(c => c.DetalleConsultaComponent)
      },
      //Prestamos
      {
        path: 'prestamos',
        redirectTo: 'estadistica/prestamos',
        pathMatch: 'full'
      },
      {
        path: 'prestamo/:id',
        loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent),

      },
      {
        path: 'editarPrestamo/:id',
        loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent),

      },
      // Médicas
      // Consulta médica — barra lateral con rutas hijas
      {
        path: 'clinica',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'medico'])],
        data: { module: MEDICA_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'pacientes-activos' },
          {
            path: 'pacientes-activos',
            loadComponent: () => import('./medica/pacienteActivos/pacienteActivos.component').then(c => c.PacienteActivosComponent)
          },
          {
            path: 'notas-medicas',
            loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
          },
          {
            path: 'notas-medicas/:consultaId',
            loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
          },
          {
            path: 'historia-clinica',
            loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
          },
          {
            path: 'historia-clinica/:id',
            loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
          },
          {
            path: 'quirofano',
            loadComponent: () => import('./medica/quirofano/quirofano.component').then(c => c.QuirofanoComponent)
          }
        ]
      },
      {
        path: 'pacientesActivos',
        loadComponent: () => import('./medica/pacienteActivos/pacienteActivos.component').then(c => c.PacienteActivosComponent),
        canActivate: [roleGuard(['admin', 'medico'])]
      },
      {
        path: 'pacientesAtendidos',
        loadComponent: () => import('./medica/pacientesAtendidos/pacientesAtendidos.component').then(c => c.PacientesAtendidosComponent)
      },
      {
        path: 'notaMedica/:consultaId',
        loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
      },
      {
        path: 'notaMedica',
        loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
      },
      {
        path: 'notaMedicas',
        loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
      },
      {
        path: 'cie10',
        loadComponent: () => import('./medica/cie10/cie10.component').then(c => c.Cie10Component),
        canActivate: [roleGuard(['admin', 'medico', 'std'])]
      },
      {
        path: 'historiaClinica/:id',
        loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
      },
      {
        path: 'verNota/:id',
        loadComponent: () => import('./medica/verNotaMedica/verNotaMedica.component').then(c => c.VerNotaMedicaComponent)
      },
      {
        path: 'historiaClinica',
        loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
      },
      // Quirófano
      {
        path: 'quirofano',
        loadComponent: () => import('./medica/quirofano/quirofano.component').then(c => c.QuirofanoComponent),
        canActivate: [roleGuard(['admin', 'medico'])]
      },
      {
        path: 'quirofano/nueva',
        loadComponent: () => import('./medica/quirofano/quirofano-form/quirofano-form.component').then(c => c.QuirofanoFormComponent),
        canActivate: [roleGuard(['admin', 'medico'])]
      },
      {
        path: 'quirofano/editar/:id',
        loadComponent: () => import('./medica/quirofano/quirofano-form/quirofano-form.component').then(c => c.QuirofanoFormComponent),
        canActivate: [roleGuard(['admin', 'medico'])]
      },
      {
        path: 'quirofano/resumen',
        redirectTo: 'estadistica/quirofano-resumen',
        pathMatch: 'full'
      },

      //Citas
      {
        path: 'citas',
        loadComponent: () => import('./registros/citas/citados/citados.component').then(c => c.CitadosComponent)
      },
      {
        path: 'agendar',
        loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
      },
      {
        path: 'agendar/paciente/:pacienteId',
        loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
      },
      {
        path: 'reagendar/cita/:citaId',
        loadComponent: () => import('./registros/citas/agendar/agendar.component').then(c => c.AgendarComponent)
      },
      {
        path: 'imprimirCitas',
        loadComponent: () => import('./registros/citas/imprimirCitas/imprimirCitas.component').then(c => c.ImprimirCitasComponent)
      },
      {
        path: 'citaspacientes',
        loadComponent: () => import('./registros/citas/citasEspecialidad/citasEspecialidad.component').then(c => c.CitasEspecialidadComponent)
      },

      //Constancias Nacimiento
      {
        path: 'nacimientos',
        loadComponent: () => import('./registros/nacimientos/listarConstancias/listarConstancias.component').then(c => c.ListarConstanciasComponent)
      },
      {
        path: 'cons-nac/:id',
        loadComponent: () => import('./registros/nacimientos/constanciasNacimiento/constanciasNacimiento.component').then(c => c.ConstanciasNacimientoComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'nueva-cons-nac',
        loadComponent: () => import('./registros/nacimientos/nuevaConstanciaNacimiento/nuevaConstanciaNacimiento.component').then(c => c.NuevaConstanciaNacimientoComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'cnprint/:id',
        loadComponent: () => import('./registros/nacimientos/hoja-cnacimiento/hoja-cnacimiento.component').then(c => c.HojaCnacimientoComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },

      //Defunciones
      {
        path: 'defunciones',
        loadComponent: () => import('./registros/defunciones/listarDefunciones/listarDefunciones.component').then(c => c.ListarDefuncionesComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'cons-def/:id',
        loadComponent: () => import('./registros/defunciones/constanciaDefuncion/constanciaDefuncion.component').then(c => c.ConstanciaDefuncionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'nueva-cons-def',
        loadComponent: () => import('./registros/defunciones/nuevaConstanciaDefuncion/nuevaConstanciaDefuncion.component').then(c => c.NuevaConstanciaDefuncionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },
      {
        path: 'cdprint/:id',
        loadComponent: () => import('./registros/defunciones/hoja-defuncion/hoja-defuncion.component').then(c => c.HojaDefuncionComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
      },

      // Estadística — barra lateral con rutas hijas
      {
        path: 'estadistica',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'std'])],
        data: { module: ESTADISTICA_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'consultar' },
          {
            path: 'consultar',
            loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
          },
          {
            path: 'prestamos',
            loadComponent: () => import('./registros/prestamos/listarPrestamos/listarPrestamos.component').then(c => c.ListarPrestamosComponent)
          },
          {
            path: 'prestamo/:id',
            loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent)
          },
          {
            path: 'editarPrestamo/:id',
            loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent)
          },
          {
            path: 'procedimientos',
            loadComponent: () => import('./std/procedimientos/procedimientosmenores/procedimientosmenores.component').then(c => c.ProcedimientosmenoresComponent)
          },
          {
            path: 'censo-camas',
            loadComponent: () => import('./std/censo-camas/censo-camas-list.component').then(c => c.CensoCamasListComponent)
          },
          {
            path: 'censo-camas/nuevo',
            loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent)
          },
          {
            path: 'censo-camas/editar/:id',
            loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          },
          {
            path: 'quirofano-resumen',
            loadComponent: () => import('./medica/quirofano/quirofano-resumen/quirofano-resumen.component').then(c => c.QuirofanoResumenComponent)
          },
          {
            path: 'personal-hospital',
            loadComponent: () => import('./std/estadistica/personal-hospital/personal-hospital-list.component').then(c => c.PersonalHospitalListComponent)
          },
          {
            path: 'detallePaciente/:id',
            loadComponent: () => import('./registros/patient/detallePaciente/detallePaciente.component').then(c => c.DetallePacienteComponent)
          },
          {
            path: 'nacimientos',
            loadComponent: () => import('./std/nacimientos/lista-nacimientos/lista-nacimientos.component').then(c => c.ListaNacimientosComponent)
          },
          {
            path: 'doctores',
            loadComponent: () => import('./std/personal_atencion/doctores/doctores.component').then(c => c.DoctoresComponent)
          },
          {
            path: 'sigsa3',
            loadComponent: () => import('./std/sigsa3/sigsa3-list/sigsa3-list.component').then(c => c.Sigsa3ListComponent)
          },
          {
            path: 'sigsa3-registros',
            loadComponent: () => import('./std/sigsa3-registros/sigsa3-registros-list/sigsa3-registros-list.component').then(c => c.Sigsa3RegistrosListComponent)
          },
          {
            path: 'agente',
            loadComponent: () => import('./std/estadistica/agente/agente.component').then(c => c.AgenteComponent)
          }
        ]
      },
      {
        path: 'agente',
        redirectTo: 'estadistica/agente',
        pathMatch: 'full'
      },
      {
        path: 'procedimientosmenores',
        redirectTo: 'estadistica/procedimientos',
        pathMatch: 'full'
      },
      {
        path: 'personal-hospital',
        redirectTo: 'estadistica/personal-hospital',
        pathMatch: 'full'
      },
      {
        path: 'consultar',
        redirectTo: 'estadistica/consultar',
        pathMatch: 'full'
      },
      {
        path: 'doctores',
        redirectTo: 'estadistica/doctores',
        pathMatch: 'full'
      },
      {
        path: 'doctor',
        loadComponent: () => import('./std/personal_atencion/doctorForm/doctorForm.component').then(c => c.DoctorFormComponent)
      },
      {
        path: 'doctor/:id',
        loadComponent: () => import('./std/personal_atencion/doctorForm/doctorForm.component').then(c => c.DoctorFormComponent)
      },
      {
        path: 'procemedic',
        loadComponent: () => import('./std/procedimientos/procemedico/procemedico.component').then(c => c.ProcemedicoComponent)
      },
      {
        path: 'procemedicEdit/:id',
        loadComponent: () => import('./std/procedimientos/procemedico/procemedico.component').then(c => c.ProcemedicoComponent)
      },
      {
        path: 'catalogoProcedimientos',
        redirectTo: 'gestion-procedimientos',
        pathMatch: 'full'
      },
      {
        path: 'nuevoProce',
        redirectTo: 'gestion-procedimientos',
        pathMatch: 'full'
      },
      {
        path: 'editProce/:id',
        redirectTo: 'gestion-procedimientos',
        pathMatch: 'full'
      },

      // Nutrición — barra lateral con rutas hijas
      {
        path: 'menu-nutri',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'nutric'])],
        data: { module: NUTRICION_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'consultar' },
          {
            path: 'consultar',
            loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
          },
          {
            path: 'coex',
            loadComponent: () => import('./nutricion/coex-nutri/coex-nutri.component').then(c => c.CoexNutriComponent)
          },
          {
            path: 'citas',
            loadComponent: () => import('./nutricion/citas-nutri/citas-nutri.component').then(c => c.CitasNutriComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          }
        ]
      },
      {
        path: 'citas-nutri',
        redirectTo: 'menu-nutri/citas',
        pathMatch: 'full'
      },
      {
        path: 'coex-nutri',
        redirectTo: 'menu-nutri/coex',
        pathMatch: 'full'
      },

      // Odontología — barra lateral con rutas hijas
      {
        path: 'menu-odonto',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'odonto'])],
        data: { module: ODONTOLOGIA_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'consultar' },
          {
            path: 'consultar',
            loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
          },
          {
            path: 'coex',
            loadComponent: () => import('./odontologia/coex-odonto/coex-odonto.component').then(c => c.CoexOdontoComponent)
          },
          {
            path: 'citas',
            loadComponent: () => import('./odontologia/citas-odonto/citas-odonto.component').then(c => c.CitasOdontoComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          }
        ]
      },
      {
        path: 'citas-odonto',
        redirectTo: 'menu-odonto/citas',
        pathMatch: 'full'
      },
      {
        path: 'coex-odonto',
        redirectTo: 'menu-odonto/coex',
        pathMatch: 'full'
      },

      // Trabajo Social — barra lateral con rutas hijas
      {
        path: 'TrabajoSocial',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'ts'])],
        data: { module: TRABAJO_SOCIAL_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'consultar' },
          {
            path: 'consultar',
            loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
          },
          {
            path: 'nacimientos',
            loadComponent: () => import('./trabajoSocial/nacimientos/nacimientos-ts.component').then(c => c.NacimientosTsComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          }
        ]
      },
      {
        path: 'ts-nacimientos',
        redirectTo: 'TrabajoSocial/nacimientos',
        pathMatch: 'full'
      },
      // Enfermería — barra lateral con rutas hijas
      {
        path: 'enfermeria',
        loadComponent: () => import('./enfermeria/menu-enfermeria/menu-enfermeria.component').then(c => c.MenuEnfermeriaComponent),
        canActivate: [roleGuard(['admin', 'paramedic', 'read_only'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'notas-medicas' },
          {
            path: 'pacientes-activos',
            loadComponent: () => import('./medica/pacienteActivos/pacienteActivos.component').then(c => c.PacienteActivosComponent)

          },
          {
            path: 'notas-medicas',
            loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
          },
          {
            path: 'notas-medicas/:consultaId',
            loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
          },
          {
            path: 'historia-clinica',
            loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
          },
          {
            path: 'historia-clinica/:id',
            loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
          },
          {
            path: 'quirofano',
            loadComponent: () => import('./medica/quirofano/quirofano.component').then(c => c.QuirofanoComponent)

          },
          {
            path: 'censo-camas',
            loadComponent: () => import('./std/censo-camas/censo-camas-list.component').then(c => c.CensoCamasListComponent)
          },
          {
            path: 'censo-camas/nuevo',
            loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent)
          },
          {
            path: 'censo-camas/editar/:id',
            loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent)
          },
          {
            path: 'medicamentos',
            loadComponent: () => import('./enfermeria/medicamentos/medicamentos-enfermeria.component').then(c => c.MedicamentosEnfermeriaComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          }
        ]
      },
      {
        path: 'ts-nacimientos',
        redirectTo: 'TrabajoSocial/nacimientos',
        pathMatch: 'full'
      },

      // UISAU — barra lateral con rutas hijas
      {
        path: 'uisau',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        canActivate: [roleGuard(['admin', 'uisau'])],
        data: { module: UISAU_NAV },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'consultar' },
          {
            path: 'consultar',
            loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
          },
          {
            path: 'lista',
            loadComponent: () => import('./uisau/encamamiento/encamamiento.component').then(c => c.EncamamientoComponent)
          },
          {
            path: 'nota',
            loadComponent: () => import('./uisau/notaUisau/notaUisau.component').then(c => c.NotaUisauComponent)
          },
          {
            path: 'nota/paciente/:pacienteId',
            loadComponent: () => import('./uisau/notaUisau/notaUisau.component').then(c => c.NotaUisauComponent)
          },
          {
            path: 'nota/:consultaId',
            loadComponent: () => import('./uisau/notaUisau/notaUisau.component').then(c => c.NotaUisauComponent)
          },
          {
            path: 'reportes',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          }
        ]
      },
      {
        path: 'encamamiento',
        redirectTo: 'uisau/lista',
        pathMatch: 'full'
      },
      {
        path: 'notaUisau/paciente/:pacienteId',
        redirectTo: 'uisau/nota/paciente/:pacienteId',
        pathMatch: 'full'
      },
      {
        path: 'notaUisau/:consultaId',
        redirectTo: 'uisau/nota/:consultaId',
        pathMatch: 'full'
      },
      {
        path: 'notaUisau',
        redirectTo: 'uisau/nota',
        pathMatch: 'full'
      },

      // Nacimientos (std)
      {
        path: 'nacimientos-std',
        redirectTo: 'estadistica/nacimientos',
        pathMatch: 'full'
      },

      // SIGSA-3
      {
        path: 'sigsa3',
        redirectTo: 'estadistica/sigsa3',
        pathMatch: 'full'
      },
      {
        path: 'sigsa3/nuevo',
        loadComponent: () => import('./std/sigsa3/sigsa3-form/sigsa3-form.component').then(c => c.Sigsa3FormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'sigsa3/editar/:id',
        loadComponent: () => import('./std/sigsa3/sigsa3-form/sigsa3-form.component').then(c => c.Sigsa3FormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'sigsa3/importar',
        loadComponent: () => import('./std/sigsa3/sigsa3-import/sigsa3-import.component').then(c => c.Sigsa3ImportComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'personal-salud',
        loadComponent: () => import('./std/sigsa3/personal-salud-list/personal-salud-list.component').then(c => c.PersonalSaludListComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'personal-salud/nuevo',
        loadComponent: () => import('./std/sigsa3/personal-salud-form/personal-salud-form.component').then(c => c.PersonalSaludFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'personal-salud/editar/:id',
        loadComponent: () => import('./std/sigsa3/personal-salud-form/personal-salud-form.component').then(c => c.PersonalSaludFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },

      // SIGSA-3 Registros (normalizados)
      {
        path: 'sigsa3-registros',
        redirectTo: 'estadistica/sigsa3-registros',
        pathMatch: 'full'
      },
      {
        path: 'sigsa3-registros/nuevo',
        loadComponent: () => import('./std/sigsa3-registros/sigsa3-registros-form/sigsa3-registros-form.component').then(c => c.Sigsa3RegistrosFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'sigsa3-registros/editar/:id',
        loadComponent: () => import('./std/sigsa3-registros/sigsa3-registros-form/sigsa3-registros-form.component').then(c => c.Sigsa3RegistrosFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },

      // Censo de Camas
      {
        path: 'censo-camas',
        redirectTo: 'estadistica/censo-camas',
        pathMatch: 'full'
      },
      {
        path: 'censo-camas/nuevo',
        loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'censo-camas/editar/:id',
        loadComponent: () => import('./std/censo-camas/censo-camas-form.component').then(c => c.CensoCamasFormComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'censo-camas/importar',
        loadComponent: () => import('./std/censo-camas/censo-camas-import.component').then(c => c.CensoCamasImportComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'censo-camas/bulk',
        loadComponent: () => import('./std/censo-camas/censo-camas-import.component').then(c => c.CensoCamasImportComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'censo-camas/upsert',
        loadComponent: () => import('./std/censo-camas/censo-camas-import.component').then(c => c.CensoCamasImportComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },

      // Reportes y Estadísticas — submenú lateral con rutas hijas (se conserva)
      {
        path: 'reportes',
        loadComponent: () => import('./shared/module-shell/module-shell.component').then(c => c.ModuleShellComponent),
        data: { module: REPORTES_NAV },
        // canActivate: [roleGuard(['admin', 'std'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./std/reportes/reportes-inicio.component').then(c => c.ReportesInicioComponent)
          },
          {
            path: 'pacientes-atendidos',
            loadComponent: () => import('./std/reportes/pacientes-atendidos/pacientes-atendidos.component').then(c => c.PacientesAtendidosComponent)
          },
          {
            path: 'hospitalizacion-infantil',
            loadComponent: () => import('./std/reportes/hospitalizacion-infantil/hospitalizacion-infantil.component').then(c => c.HospitalizacionInfantilComponent)
          },
          {
            path: 'promedio-diario',
            loadComponent: () => import('./std/reportes/promedio-diario/promedio-diario.component').then(c => c.PromedioDiarioComponent)
          },
          {
            path: 'personal-hospital',
            loadComponent: () => import('./std/reportes/personal-hospital/personal-hospital.component').then(c => c.PersonalHospitalComponent)
          },
          {
            path: 'estudiante-publico',
            loadComponent: () => import('./std/reportes/estudiante-publico/estudiante-publico.component').then(c => c.EstudiantePublicoComponent)
          },
          {
            path: 'reingresos',
            loadComponent: () => import('./std/reportes/reingresos/reingresos.component').then(c => c.ReingresosComponent)
          },
          {
            path: 'reingresos-tipo3',
            loadComponent: () => import('./std/reportes/reingresos-tipo3/reingresos-tipo3.component').then(c => c.ReingresosTipo3Component)
          },
          {
            path: 'activos-mayores-7-dias',
            loadComponent: () => import('./std/reportes/activos-mayores-7-dias/activos-mayores-7-dias.component').then(c => c.ActivosMayores7DiasComponent)
          },
          {
            path: 'estadisticas-nacimientos',
            loadComponent: () => import('./std/reportes/estadisticas-nacimientos/estadisticas-nacimientos.component').then(c => c.EstadisticasNacimientosComponent)
          },
          {
            path: 'reporte-procedimientos',
            loadComponent: () => import('./std/reportes/procedimientos-dashboard/procedimientos-dashboard.component').then(c => c.ProcedimientosDashboardComponent)
          },
          {
            path: 'resumen-procedimientos',
            loadComponent: () => import('./std/reportes/procedimientos-dashboard/procedimientos-dashboard.component').then(c => c.ProcedimientosDashboardComponent)
          },
          {
            path: 'procedimientos',
            loadComponent: () => import('./std/reportes/procedimientos-dashboard/procedimientos-dashboard.component').then(c => c.ProcedimientosDashboardComponent)
          },
          {
            path: 'captura-procedimientos',
            loadComponent: () => import('./std/reportes/captura-procedimientos/captura-procedimientos.component').then(c => c.CapturaProcedimientosComponent)
          },
          {
            path: 'sigsa3-estadistica',
            loadComponent: () => import('./std/reportes/sigsa3-estadistica/sigsa3-estadistica.component').then(c => c.Sigsa3EstadisticaComponent)
          },
          {
            path: 'sigsa3-dx-frecuentes',
            loadComponent: () => import('./std/reportes/sigsa3-dx-frecuentes/sigsa3-dx-frecuentes.component').then(c => c.Sigsa3DxFrecuentesComponent)
          },
          {
            path: 'dx-z-cie10',
            loadComponent: () => import('./std/reportes/dx-z-cie10/dx-z-cie10.component').then(c => c.DxZCie10Component)
          },
          {
            path: 'indicadores-consultas',
            loadComponent: () => import('./std/reportes/indicadores-consultas/indicadores-consultas.component').then(c => c.IndicadoresConsultasComponent)
          },
          {
            path: 'referencias-consultas',
            loadComponent: () => import('./std/reportes/referencias-consultas/referencias-consultas.component').then(c => c.ReferenciasConsultasComponent)
          },
        ]
      },
    ]
  }
];
