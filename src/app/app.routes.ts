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
import { PrestamoComponent } from './Registros/consultas/prestamo/prestamo.component';
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

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'dash', component: DashboardComponent, canActivate: [AuthGuard] },
  // Registros Médicos
  { path: 'registros', component: RegistrosMedicosComponent, canActivate: [AuthGuard] },
  { path: 'admision', component: AdmisionComponent, canActivate: [AuthGuard] },
  { path: 'admision/:origen', component: AdmisionComponent, canActivate: [AuthGuard] },
  { path: 'admisionPaciente/:origen/:pacienteId', component: AdmisionComponent, canActivate: [AuthGuard] },
  { path: 'editarAdmision/:id/:origen', component: AdmisionComponent, canActivate: [AuthGuard] },
  { path: 'editarAdmision/:id', component: AdmisionComponent, canActivate: [AuthGuard] },
  { path: 'detalleAdmision/:id', component: DetalleConsultaComponent, canActivate: [AuthGuard] },
  // Pacientes
  { path: 'pacientes', component: PacientesComponent, canActivate: [AuthGuard] },
  { path: 'paciente', component: FormularioPacienteComponent, canActivate: [AuthGuard] },
  { path: 'paciente/:modo', component: FormularioPacienteComponent, canActivate: [AuthGuard] },
  { path: 'detallePaciente/:id', component: DetallePacienteComponent, canActivate: [AuthGuard] },
  { path: 'pacienteEdit/:id', component: FormularioPacienteComponent, canActivate: [AuthGuard] },
  // Emergencias
  { path: 'emergencias', component: EmergenciasListComponent, canActivate: [AuthGuard] },
  { path: 'hojaEmergencia/:id', component: HojaComponent, canActivate: [AuthGuard] },
  //Consulta externa
  { path: 'coex', component: CoexListaComponent, canActivate: [AuthGuard] },
  { path: 'coexHoja/:id', component: HojaCoexComponent, canActivate: [AuthGuard] },
  // Hospitalizacion
  { path: 'ingresos', component: IngresosComponent, canActivate: [AuthGuard] },
  { path: 'ingreso/:id', component: HojaIngresoComponent, canActivate: [AuthGuard] },
  // Consultas
  { path: 'consultas', component: ConsultasComponent, canActivate: [AuthGuard] },
  { path: 'recepcion', component: RecepcionComponent, canActivate: [AuthGuard] },
  { path: 'prestamos', component: PrestamoComponent, canActivate: [AuthGuard] },
  { path: 'registro', component: FormConsultaComponent, canActivate: [AuthGuard] },
  { path: 'renap', component: RenapComponent, canActivate: [AuthGuard] },
];
