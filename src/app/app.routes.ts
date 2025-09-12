import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './principal/login/login.component';
import { DashboardComponent } from './principal/dashboard/dashboard.component';
import { HomeComponent } from './principal/home/home.component';
import { PacientesComponent } from './Registros/patient/pacientes/pacientes.component';
import { FormularioPacienteComponent } from './Registros/patient/formularioPaciente/formularioPaciente.component';
import { CoexComponent } from './Registros/adminsion/coex/coex.component';
import { EmergenciaComponent } from './Registros/adminsion/emergencia/emergencia.component';
import { HospitalizacionComponent } from './Registros/adminsion/hospitalizacion/hospitalizacion.component';
import { ConsultasComponent } from './Registros/adminsion/consultas/consultas.component';
import { RecepcionComponent } from './Registros/adminsion/recepcion/recepcion.component';
import { PrestamoComponent } from './Registros/adminsion/prestamo/prestamo.component';
import { FormConsultaComponent } from './Registros/adminsion/formConsulta/formConsulta.component';
import { RegistrosMedicosComponent } from './Registros/registrosMedicos/registrosMedicos.component';
import { DetallePacienteComponent } from './Registros/patient/detallePaciente/detallePaciente.component';
import { RenapComponent } from './Registros/patient/renap/renap.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'dash', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'registros', component: RegistrosMedicosComponent, canActivate: [AuthGuard] },
  { path: 'pacientes', component: PacientesComponent, canActivate: [AuthGuard] },
  { path: 'paciente', component: FormularioPacienteComponent, canActivate: [AuthGuard] },
  { path: 'detallePaciente/:id', component: DetallePacienteComponent, canActivate: [AuthGuard] },
  { path: 'paciente/:id', component: FormularioPacienteComponent, canActivate: [AuthGuard] },
  { path: 'coex', component: CoexComponent, canActivate: [AuthGuard] },
  { path: 'emergencia', component: EmergenciaComponent, canActivate: [AuthGuard] },
  { path: 'ingreso', component: HospitalizacionComponent, canActivate: [AuthGuard] },
  { path: 'consultas', component: ConsultasComponent, canActivate: [AuthGuard] },
  { path: 'recepcion', component: RecepcionComponent, canActivate: [AuthGuard] },
  { path: 'prestamos', component: PrestamoComponent, canActivate: [AuthGuard] },
  { path: 'registro', component: FormConsultaComponent, canActivate: [AuthGuard] },
  { path: 'renap', component: RenapComponent, canActivate: [AuthGuard] },
];
