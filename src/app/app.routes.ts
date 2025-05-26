import { Routes } from '@angular/router';
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

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'dash', component: DashboardComponent },
  { path: 'registros', component: RegistrosMedicosComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'paciente', component: FormularioPacienteComponent },
  { path: 'paciente/:id', component: FormularioPacienteComponent },
  { path: 'coex', component: CoexComponent },
  { path: 'emergencia', component: EmergenciaComponent },
  { path: 'ingreso', component: HospitalizacionComponent },
  { path: 'consultas', component: ConsultasComponent },
  { path: 'recepcion', component: RecepcionComponent },
  { path: 'prestamos', component: PrestamoComponent },
  { path: 'registro', component: FormConsultaComponent }
];
