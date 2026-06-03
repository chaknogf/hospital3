import { HojaCnacimientoComponent } from './registros/nacimientos/hoja-cnacimiento/hoja-cnacimiento.component';
import { HojaIngresoComponent } from './registros/consultas/hospitalizacion/hojaIngreso/hojaIngreso.component';
import { EmergenciasListComponent } from './registros/consultas/emergencias/emergenciasList/emergenciasList.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './principal/login/login.component';
import { DashboardComponent } from './principal/dashboard/dashboard.component';
import { HomeComponent } from './principal/home/home.component';
import { PacientesComponent } from './registros/patient/pacientes/pacientes.component';
import { FormularioPacienteComponent } from './registros/patient/formularioPaciente/formularioPaciente.component';
import { ConsultasComponent } from './registros/consultas/consultas/consultas.component';
import { RecepcionComponent } from './registros/consultas/recepcion/recepcion.component';
import { FormConsultaComponent } from './registros/adminsion/formConsulta/formConsulta.component';
import { RegistrosMedicosComponent } from './registros/registrosMedicos/registrosMedicos.component';
import { DetallePacienteComponent } from './registros/patient/detallePaciente/detallePaciente.component';
import { RenapComponent } from './registros/patient/renap/renap.component';
import { HojaComponent } from './registros/consultas/emergencias/hoja/hoja.component';
import { AdmisionComponent } from './registros/adminsion/admision/admision.component';
import { DetalleConsultaComponent } from './registros/adminsion/detalleConsulta/detalleConsulta.component';
import { CoexListaComponent } from './registros/consultas/coex/coexLista/coexLista.component';
import { HojaCoexComponent } from './registros/consultas/coex/HojaCoex/HojaCoex.component';
import { IngresosComponent } from './registros/consultas/hospitalizacion/ingresos/ingresos.component';
import { MedicaComponent } from './medica/medica/medica.component';
import { PacientesAtendidosComponent } from './medica/pacientesAtendidos/pacientesAtendidos.component';
import { ConstanciasNacimientoComponent } from './registros/nacimientos/constanciasNacimiento/constanciasNacimiento.component';
import { ListarConstanciasComponent } from './registros/nacimientos/listarConstancias/listarConstancias.component';
import { HijosComponent } from './registros/patient/hijos/hijos.component';
import { CitadosComponent } from './registros/citas/citados/citados.component';
import { AgendarComponent } from './registros/citas/agendar/agendar.component';
import { NotaMedicaComponent } from './medica/notaMedica/notaMedica.component';
import { HistoriaClinicaComponent } from './medica/historiaClinica/historiaClinica.component';
import { AdminComponent } from './principal/administrador/admin/admin.component';
import { UsuariosComponent } from './principal/administrador/usuarios/usuarios.component';
import { UsuarioComponent } from './principal/administrador/usuario/usuario.component';
import { RegistrarComponent } from './principal/administrador/registrar/registrar.component';
import { RecuperarComponent } from './principal/administrador/recuperar/recuperar.component';
import { roleGuard } from './role.guard';
import { EstadisticaComponent } from './std/estadistica/estadistica.component';
import { ConsultorComponent } from './std/consultor/consultor.component';
import { MenutsComponent } from './trabajoSocial/trabajosocial/menuts.component';
import { NuevaConstanciaNacimientoComponent } from './registros/nacimientos/nuevaConstanciaNacimiento/nuevaConstanciaNacimiento.component';
import { ListarPrestamosComponent } from './registros/prestamos/listarPrestamos/listarPrestamos.component';
import { CrearPrestamoComponent } from './registros/prestamos/crearPrestamo/crearPrestamo.component';
import { ImprimirCitasComponent } from './registros/citas/imprimirCitas/imprimirCitas.component';
import { DoctoresComponent } from './std/medicos/doctores/doctores.component';
import { DoctorFormComponent } from './std/medicos/doctorForm/doctorForm.component';
import { HojaCoexOdontoComponent } from './registros/consultas/coex/HojaCoexOdonto/HojaCoexOdonto.component';
import { HojaCoexPsicoComponent } from './registros/consultas/coex/HojaCoexPsico/HojaCoexPsico.component';
import { UisauMenuComponent } from './uisau/uisaMenu/uisauMenu.component';
import { EncamamientoComponent } from './uisau/encamamiento/encamamiento.component';
import { ProcedimientosmenoresComponent } from './std/procedimientos/procedimientosmenores/procedimientosmenores.component';
import { ProcemedicoComponent } from './std/procedimientos/procemedico/procemedico.component';
import { CatalogoprocedimientoComponent } from './std/procedimientos/catalogoprocedimiento/catalogoprocedimiento.component';
import { NuevoprocedimientoComponent } from './std/procedimientos/nuevoprocedimiento/nuevoprocedimiento.component';
import { ImprimirCoexComponent } from './registros/consultas/coex/imprimirCoex/imprimirCoex.component';
import { CitasEspecialidadComponent } from './registros/citas/citasEspecialidad/citasEspecialidad.component';
import { MenuNutriComponent } from './nutricion/menu-nutri/menu-nutri.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'resetpass', component: RecuperarComponent },

  // ── Rutas protegidas agrupadas ──
  {
    path: '',
    canActivate: [AuthGuard], // ← se aplica a todas las hijas
    children: [
      { path: 'dash', component: DashboardComponent },
      //admin
      { path: 'adminsys', component: AdminComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'usuario/:id', component: UsuarioComponent },
      { path: 'newuser', component: RegistrarComponent },


      // Registros Médicos
      { path: 'registros', component: RegistrosMedicosComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'admision', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'admision/:origen', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'admisionPaciente/:origen/:pacienteId', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'editarAdmision/:id/:origen', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'editarAdmision/:id', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      // { path: 'formConsulta/:id', component: AdmisionComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'detalleAdmision/:id', component: DetalleConsultaComponent },

      { path: 'hijo/:id', component: HijosComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },


      // Pacientes
      { path: 'pacientes', component: PacientesComponent },
      { path: 'paciente', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'paciente/:modo', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'detallePaciente/:id', component: DetallePacienteComponent },
      { path: 'pacienteEdit/:id', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      // Emergencias
      { path: 'emergencias', component: EmergenciasListComponent },
      { path: 'hojaEmergencia/:id', component: HojaComponent },
      // Consulta externa
      { path: 'coex', component: CoexListaComponent },
      { path: 'coexHoja/:id', component: HojaCoexComponent },
      { path: 'hojaPsico/:id', component: HojaCoexPsicoComponent },
      { path: 'hojaOdonto/:id', component: HojaCoexOdontoComponent },
      { path: 'imprimircoex', component: ImprimirCoexComponent },
      // Hospitalización
      { path: 'ingresos', component: IngresosComponent },
      { path: 'ingreso/:id', component: HojaIngresoComponent },
      // Consultas
      { path: 'consultas', component: ConsultasComponent },
      { path: 'recepcion', component: RecepcionComponent },
      { path: 'registro', component: FormConsultaComponent },
      { path: 'renap', component: RenapComponent },
      //Prestamos
      { path: 'prestamos', component: ListarPrestamosComponent, canActivate: [roleGuard(['admin', 'registro'])] },
      { path: 'prestamo/:id', component: CrearPrestamoComponent, canActivate: [roleGuard(['admin', 'registro'])] },
      { path: 'editarPrestamo/:id', component: CrearPrestamoComponent, canActivate: [roleGuard(['admin', 'registro'])] },
      // Médicas
      { path: 'clinica', component: MedicaComponent, canActivate: [roleGuard(['admin', 'medico'])] },
      { path: 'pacientesAtendidos', component: PacientesAtendidosComponent },
      { path: 'notaMedica/:consultaId', component: NotaMedicaComponent },
      { path: 'notaMedicas', component: NotaMedicaComponent },
      { path: 'historiaClinica/:consultaId', component: HistoriaClinicaComponent },

      //Citas
      { path: 'citas', component: CitadosComponent },
      { path: 'agendar', component: AgendarComponent },
      { path: 'agendar/paciente/:pacienteId', component: AgendarComponent },
      { path: 'reagendar/cita/:citaId', component: AgendarComponent },
      { path: 'imprimirCitas', component: ImprimirCitasComponent },
      { path: 'citaspacientes', component: CitasEspecialidadComponent },

      //Constancias Nacimiento
      { path: 'nacimientos', component: ListarConstanciasComponent },
      { path: 'cons-nac/:id', component: ConstanciasNacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'nueva-cons-nac', component: NuevaConstanciaNacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'cnprint/:id', component: HojaCnacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },

      //Estadistica
      { path: 'estadistica', component: EstadisticaComponent, canActivate: [roleGuard(['admin', 'std'])] },
      { path: 'consultar', component: ConsultorComponent },
      { path: 'doctores', component: DoctoresComponent },
      { path: 'doctor', component: DoctorFormComponent },
      { path: 'doctor/:id', component: DoctorFormComponent },
      { path: 'procedimientosmenores', component: ProcedimientosmenoresComponent },
      { path: 'procemedic', component: ProcemedicoComponent },
      { path: 'procemedicEdit/:id', component: ProcemedicoComponent },
      { path: 'catalogoProcedimientos', component: CatalogoprocedimientoComponent },
      { path: 'nuevoProce', component: NuevoprocedimientoComponent },
      { path: 'editProce/:id', component: NuevoprocedimientoComponent },


      // Nutricion
      { path: 'menu-nutri', component: MenuNutriComponent, canActivate: [roleGuard(['admin', 'nutricion'])] },

      //TrabajoSocial
      { path: 'TrabajoSocial', component: MenutsComponent, canActivate: [roleGuard(['admin', 'ts'])] },

      //UISAU
      { path: 'uisau', component: UisauMenuComponent, canActivate: [roleGuard(['admin', 'uisau'])] },
      { path: 'encamamiento', component: EncamamientoComponent, canActivate: [roleGuard(['admin', 'uisau'])] },

    ]
  }
];
