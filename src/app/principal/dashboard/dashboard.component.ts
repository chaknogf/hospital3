
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { tarjetaPaciente, datosIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {

  modulos: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  // svg
  tarjetaPaciente: SafeHtml = tarjetaPaciente;
  datosIcon: SafeHtml = datosIcon;
  constructor(
    private route: Router,
    private sanitizer: DomSanitizer
  ) {

    this.tarjetaPaciente = this.sanitizer.bypassSecurityTrustHtml(tarjetaPaciente);
    this.datosIcon = this.sanitizer.bypassSecurityTrustHtml(datosIcon);

  }



  ngOnInit() {

    this.modulos = [
      {
        nombre: 'Pacientes',
        descripcion: 'Gestión de pacientes y registros médicos',
        ruta: '/registros',
        icon: this.tarjetaPaciente
      },
      {
        nombre: 'UISAU',
        descripcion: 'Gestor de Atención al Usuario',
        ruta: '/usisau'
      },
      {
        nombre: 'Vacunas',
        descripcion: 'Control de vacunas y esquemas',
        ruta: '/vacunas'
      },
      {
        nombre: 'Personal',
        descripcion: 'Administración del personal médico',
        ruta: '/personal'
      },
      {
        nombre: 'Estadística',
        descripcion: 'Gestión de reportes y datos estadísticos',
        ruta: '/estadistica',
        icon: this.datosIcon
      },
      {
        nombre: 'Clínica',
        descripcion: 'Gestión de consulta médica',
        ruta: '/clinica'
      },
      {
        nombre: 'Reportes y SIGSA',
        descripcion: 'Imprime reportes y sigsas',
        ruta: '/reportes'
      },
      {
        nombre: 'Rayos X',
        descripcion: 'Gestor de rayos x',
        ruta: '/rayos'
      },
      {
        nombre: 'Laboratorio',
        descripcion: 'Gestor de laboratorio',
        ruta: '/laboratorio'
      },
      {
        nombre: 'Farmacia',
        descripcion: 'Gestor de farmacia',
        ruta: '/farmacia'
      },
      {
        nombre: 'Configuraciones',
        descripcion: 'Configuraciones del sistema',
        ruta: '/configuraciones'
      },
      {
        nombre: 'Usuarios',
        descripcion: 'Gestor de usuarios',
        ruta: '/usuarios'
      },
      {
        nombre: 'Salir',
        descripcion: 'Salir del sistema',
        ruta: '/inicio'
      },
    ]
  }





}

