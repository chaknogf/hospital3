import { HojaCnacimientoComponent } from './Registros/nacimientos/hoja-cnacimiento/hoja-cnacimiento.component';
import { HojaIngresoComponent } from './Registros/consultas/hospitalizacion/hojaIngreso/hojaIngreso.component';
import { EmergenciasListComponent } from './Registros/consultas/emergencias/emergenciasList/emergenciasList.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './principal/login/login.component';
import { DashboardComponent } from './principal/dashboard/dashboard.component';
import { HomeComponent } from './principal/home/home.component';
import { PacientesComponent } from './Registros/patient/pacientes/pacientes.component';
import { FormularioPacienteComponent } from './Registros/patient/formularioPaciente/formularioPaciente.component';
import { ConsultasComponent } from './Registros/consultas/consultas/consultas.component';
import { RecepcionComponent } from './Registros/consultas/recepcion/recepcion.component';
import { FormConsultaComponent } from './Registros/adminsion/formConsulta/formConsulta.component';
import { RegistrosMedicosComponent } from './Registros/registrosMedicos/registrosMedicos.component';
import { DetallePacienteComponent } from './Registros/patient/detallePaciente/detallePaciente.component';
import { RenapComponent } from './Registros/patient/renap/renap.component';
import { HojaComponent } from './Registros/consultas/emergencias/hoja/hoja.component';
import { AdmisionComponent } from './Registros/adminsion/admision/admision.component';
import { DetalleConsultaComponent } from './Registros/adminsion/detalleConsulta/detalleConsulta.component';
import { CoexListaComponent } from './Registros/consultas/coex/coexLista/coexLista.component';
import { HojaCoexComponent } from './Registros/consultas/coex/HojaCoex/HojaCoex.component';
import { IngresosComponent } from './Registros/consultas/hospitalizacion/ingresos/ingresos.component';
import { MedicaComponent } from './medica/medica/medica.component';
import { PacientesAtendidosComponent } from './medica/pacientesAtendidos/pacientesAtendidos.component';
import { ConstanciasNacimientoComponent } from './Registros/nacimientos/constanciasNacimiento/constanciasNacimiento.component';
import { ListarConstanciasComponent } from './Registros/nacimientos/listarConstancias/listarConstancias.component';
import { HijosComponent } from './Registros/patient/hijos/hijos.component';
import { CitadosComponent } from './Registros/citas/citados/citados.component';
import { AgendarComponent } from './Registros/citas/agendar/agendar.component';
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
import { NuevaConstanciaNacimientoComponent } from './Registros/nacimientos/nuevaConstanciaNacimiento/nuevaConstanciaNacimiento.component';
import { ListarPrestamosComponent } from './Registros/prestamos/listarPrestamos/listarPrestamos.component';
import { CrearPrestamoComponent } from './Registros/prestamos/crearPrestamo/crearPrestamo.component';

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
      { path: 'detalleAdmision/:id', component: DetalleConsultaComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },

      { path: 'hijo/:id', component: HijosComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },


      // Pacientes
      { path: 'pacientes', component: PacientesComponent },
      { path: 'paciente', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'paciente/:modo', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'detallePaciente/:id', component: DetallePacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'pacienteEdit/:id', component: FormularioPacienteComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      // Emergencias
      { path: 'emergencias', component: EmergenciasListComponent },
      { path: 'hojaEmergencia/:id', component: HojaComponent },
      // Consulta externa
      { path: 'coex', component: CoexListaComponent },
      { path: 'coexHoja/:id', component: HojaCoexComponent },
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
      { path: 'clinica', component: MedicaComponent },
      { path: 'pacientesAtendidos', component: PacientesAtendidosComponent },
      { path: 'notaMedica/:consultaId', component: NotaMedicaComponent },
      { path: 'notaMedicas', component: NotaMedicaComponent },
      { path: 'historiaClinica/:consultaId', component: HistoriaClinicaComponent },

      //Citas
      { path: 'citas', component: CitadosComponent },
      { path: 'agendar', component: AgendarComponent },
      { path: 'agendar/paciente/:pacienteId', component: AgendarComponent },
      { path: 'reagendar/cita/:citaId', component: AgendarComponent },

      //Constancias Nacimiento
      { path: 'nacimientos', component: ListarConstanciasComponent },
      { path: 'cons-nac/:id', component: ConstanciasNacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'nueva-cons-nac', component: NuevaConstanciaNacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },
      { path: 'cnprint/:id', component: HojaCnacimientoComponent, canActivate: [roleGuard(['admin', 'registro', 'std'])] },

      //Estadistica
      { path: 'estadistica', component: EstadisticaComponent, canActivate: [roleGuard(['admin', 'std'])] },
      { path: 'consultar', component: ConsultorComponent },

      //TrabajoSocial
      { path: 'TrabajoSocial', component: MenutsComponent, canActivate: [roleGuard(['admin', 'ts'])] },

    ]
  }
];
