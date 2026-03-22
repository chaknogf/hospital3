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
import { MedicaComponent } from './medica/medica/medica.component';
import { PacientesAtendidosComponent } from './medica/pacientesAtendidos/pacientesAtendidos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },

  // ── Rutas protegidas agrupadas ──
  {
    path: '',
    canActivate: [AuthGuard], // ← se aplica a todas las hijas
    children: [
      { path: 'dash', component: DashboardComponent },
      // Registros Médicos
      { path: 'registros', component: RegistrosMedicosComponent },
      { path: 'admision', component: AdmisionComponent },
      { path: 'admision/:origen', component: AdmisionComponent },
      { path: 'admisionPaciente/:origen/:pacienteId', component: AdmisionComponent },
      { path: 'editarAdmision/:id/:origen', component: AdmisionComponent },
      { path: 'editarAdmision/:id', component: AdmisionComponent },
      { path: 'detalleAdmision/:id', component: DetalleConsultaComponent },

      // Pacientes
      { path: 'pacientes', component: PacientesComponent },
      { path: 'paciente', component: FormularioPacienteComponent },
      { path: 'paciente/:modo', component: FormularioPacienteComponent },
      { path: 'detallePaciente/:id', component: DetallePacienteComponent },
      { path: 'pacienteEdit/:id', component: FormularioPacienteComponent },
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
      { path: 'prestamos', component: PrestamoComponent },
      { path: 'registro', component: FormConsultaComponent },
      { path: 'renap', component: RenapComponent },
      // Médicas
      { path: 'clinica', component: MedicaComponent },
      { path: 'pacientesAtendidos', component: PacientesAtendidosComponent },
    ]
  }
];
