
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TarjetaPacienteComponent } from "../../icons-components/tarjetaPaciente/tarjetaPaciente.component";
import { DatosIconComponent } from '../../icons-components/datosIcon/datosIcon.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TarjetaPacienteComponent, DatosIconComponent]
})
export class DashboardComponent implements OnInit {

  constructor(
    private route: Router
  ) { }

  ngOnInit() {
  }

  modulos = [
    { nombre: 'Pacientes', descripcion: 'Gestión de pacientes y registros médicos', ruta: '/pacientes', icon: TarjetaPacienteComponent },
    { nombre: 'UISAU', descripcion: 'Gestor de Atención al Usuario', ruta: '/usisau' },
    // { nombre: 'Vacunas', descripcion: 'Control de vacunas y esquemas', ruta: '/vacunas' },
    { nombre: 'Personal', descripcion: 'Administración del personal médico', ruta: '/personal' },
    { nombre: 'Estadística', descripcion: 'Gestión de reportes y datos estadísticos', ruta: '/estadistica', icon: DatosIconComponent },
    { nombre: 'Clínica', descripcion: 'Gestión de consulta médica', ruta: '/clinica' },
    { nombre: 'Reportes y SIGSA', descripcion: 'Imprime reportes y sigsas', ruta: '/reportes' },
    { nombre: 'Rayos X', descripcion: 'Gestor de rayos x', ruta: '/rayos' },
    { nombre: 'Laboratorio', descripcion: 'Gestión de Laboratorio', ruta: '/laboratorio' },

  ];
}

