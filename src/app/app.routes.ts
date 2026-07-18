import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { roleGuard } from './role.guard';

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

      // Registros Médicos
      {
        path: 'registros',
        loadComponent: () => import('./registros/registrosMedicos/registrosMedicos.component').then(c => c.RegistrosMedicosComponent),
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
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
        canActivate: [roleGuard(['admin', 'registro', 'std'])]
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
        path: 'renap',
        loadComponent: () => import('./registros/patient/renap/renap.component').then(c => c.RenapComponent)
      },
      //Prestamos
      {
        path: 'prestamos',
        loadComponent: () => import('./registros/prestamos/listarPrestamos/listarPrestamos.component').then(c => c.ListarPrestamosComponent),
        canActivate: [roleGuard(['admin', 'registro'])]
      },
      {
        path: 'prestamo/:id',
        loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent),
        canActivate: [roleGuard(['admin', 'registro'])]
      },
      {
        path: 'editarPrestamo/:id',
        loadComponent: () => import('./registros/prestamos/crearPrestamo/crearPrestamo.component').then(c => c.CrearPrestamoComponent),
        canActivate: [roleGuard(['admin', 'registro'])]
      },
      // Médicas
      {
        path: 'clinica',
        loadComponent: () => import('./medica/medica/medica.component').then(c => c.MedicaComponent),
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
        path: 'notaMedicas',
        loadComponent: () => import('./medica/notaMedica/notaMedica.component').then(c => c.NotaMedicaComponent)
      },
      {
        path: 'cie10',
        loadComponent: () => import('./medica/cie10/cie10.component').then(c => c.Cie10Component),
        canActivate: [roleGuard(['admin', 'medico', 'std'])]
      },
      {
        path: 'historiaClinica/:consultaId',
        loadComponent: () => import('./medica/historiaClinica/historiaClinica.component').then(c => c.HistoriaClinicaComponent)
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

      //Estadistica
      {
        path: 'estadistica',
        loadComponent: () => import('./std/estadistica/estadistica.component').then(c => c.EstadisticaComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'agente',
        loadComponent: () => import('./std/estadistica/agente/agente.component').then(c => c.AgenteComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'personal-hospital',
        loadComponent: () => import('./std/estadistica/personal-hospital/personal-hospital-list.component').then(c => c.PersonalHospitalListComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },
      {
        path: 'consultar',
        loadComponent: () => import('./std/consultor/consultor.component').then(c => c.ConsultorComponent)
      },
      {
        path: 'doctores',
        loadComponent: () => import('./std/medicos/doctores/doctores.component').then(c => c.DoctoresComponent)
      },
      {
        path: 'doctor',
        loadComponent: () => import('./std/medicos/doctorForm/doctorForm.component').then(c => c.DoctorFormComponent)
      },
      {
        path: 'doctor/:id',
        loadComponent: () => import('./std/medicos/doctorForm/doctorForm.component').then(c => c.DoctorFormComponent)
      },
      {
        path: 'procedimientosmenores',
        loadComponent: () => import('./std/procedimientos/procedimientosmenores/procedimientosmenores.component').then(c => c.ProcedimientosmenoresComponent)
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
        loadComponent: () => import('./std/procedimientos/catalogoprocedimiento/catalogoprocedimiento.component').then(c => c.CatalogoprocedimientoComponent)
      },
      {
        path: 'nuevoProce',
        loadComponent: () => import('./std/procedimientos/nuevoprocedimiento/nuevoprocedimiento.component').then(c => c.NuevoprocedimientoComponent)
      },
      {
        path: 'editProce/:id',
        loadComponent: () => import('./std/procedimientos/nuevoprocedimiento/nuevoprocedimiento.component').then(c => c.NuevoprocedimientoComponent)
      },

      // Nutricion
      {
        path: 'menu-nutri',
        loadComponent: () => import('./nutricion/menu-nutri/menu-nutri.component').then(c => c.MenuNutriComponent),
        canActivate: [roleGuard(['admin', 'nutric'])]
      },
      {
        path: 'citas-nutri',
        loadComponent: () => import('./nutricion/citas-nutri/citas-nutri.component').then(c => c.CitasNutriComponent),
        canActivate: [roleGuard(['admin', 'nutric'])]
      },
      {
        path: 'coex-nutri',
        loadComponent: () => import('./nutricion/coex-nutri/coex-nutri.component').then(c => c.CoexNutriComponent),
        canActivate: [roleGuard(['admin', 'nutric'])]
      },

      // Odonto
      {
        path: 'menu-odonto',
        loadComponent: () => import('./odontologia/menu-odonto/menu-odonto.component').then(c => c.MenuOdontoComponent),
        canActivate: [roleGuard(['admin', 'odonto'])]
      },
      {
        path: 'citas-odonto',
        loadComponent: () => import('./odontologia/citas-odonto/citas-odonto.component').then(c => c.CitasOdontoComponent),
        canActivate: [roleGuard(['admin', 'odonto'])]
      },
      {
        path: 'coex-odonto',
        loadComponent: () => import('./odontologia/coex-odonto/coex-odonto.component').then(c => c.CoexOdontoComponent),
        canActivate: [roleGuard(['admin', 'odonto'])]
      },

      //TrabajoSocial
      {
        path: 'TrabajoSocial',
        loadComponent: () => import('./trabajoSocial/trabajosocial/menuts.component').then(c => c.MenutsComponent),
        canActivate: [roleGuard(['admin', 'ts'])]
      },
      {
        path: 'ts-nacimientos',
        loadComponent: () => import('./trabajoSocial/nacimientos/nacimientos-ts.component').then(c => c.NacimientosTsComponent),
        canActivate: [roleGuard(['admin', 'ts'])]
      },

      //UISAU
      {
        path: 'uisau',
        loadComponent: () => import('./uisau/uisaMenu/uisauMenu.component').then(c => c.UisauMenuComponent),
        canActivate: [roleGuard(['admin', 'uisau'])]
      },
      {
        path: 'encamamiento',
        loadComponent: () => import('./uisau/encamamiento/encamamiento.component').then(c => c.EncamamientoComponent),
        canActivate: [roleGuard(['admin', 'uisau'])]
      },

      // Nacimientos (std)
      {
        path: 'nacimientos-std',
        loadComponent: () => import('./std/nacimientos/lista-nacimientos/lista-nacimientos.component').then(c => c.ListaNacimientosComponent),
        canActivate: [roleGuard(['admin', 'std'])]
      },

      // SIGSA-3
      {
        path: 'sigsa3',
        loadComponent: () => import('./std/sigsa3/sigsa3-list/sigsa3-list.component').then(c => c.Sigsa3ListComponent),
        canActivate: [roleGuard(['admin', 'std'])]
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

      // Censo de Camas
      {
        path: 'censo-camas',
        loadComponent: () => import('./std/censo-camas/censo-camas-list.component').then(c => c.CensoCamasListComponent),
        canActivate: [roleGuard(['admin', 'std'])]
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

      // Reportes y Estadísticas — submenú lateral con rutas hijas
      {
        path: 'reportes',
        loadComponent: () => import('./std/reportes/reportes.component').then(c => c.ReportesComponent),
        canActivate: [roleGuard(['admin', 'std'])],
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
            loadComponent: () => import('./std/reportes/reporte-procedimientos/reporte-procedimientos.component').then(c => c.ReporteProcedimientosComponent)
          },
          {
            path: 'resumen-procedimientos',
            loadComponent: () => import('./std/reportes/resumen-procedimientos/resumen-procedimientos.component').then(c => c.ResumenProcedimientosComponent)
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
        ]
      },
    ]
  }
];
