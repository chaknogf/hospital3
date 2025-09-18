import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, enfermoIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-registrosMedicos',
  templateUrl: './registrosMedicos.component.html',
  styleUrls: ['./registrosMedicos.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]

})
export class RegistrosMedicosComponent implements OnInit {

  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];


  //svg
  MenuIcon: SafeHtml = menuIcon;
  PatienIcon: SafeHtml = patientIcon;
  AmbulanceIcon: SafeHtml = ambulanceIcon;
  EnfermoIcon: SafeHtml = enfermoIcon;
  HospIcon: SafeHtml = hospitalconsvg;
  ConsultasIcon: SafeHtml = consultasIcon;
  ArchivoIcon: SafeHtml = archivoIcon;
  CompartirIcon: SafeHtml = compartirIcon;
  CalendarIcon: SafeHtml = calendarIcon;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    this.MenuIcon = this.sanitizer.bypassSecurityTrustHtml(menuIcon);
    this.PatienIcon = this.sanitizer.bypassSecurityTrustHtml(patientIcon);
    this.AmbulanceIcon = this.sanitizer.bypassSecurityTrustHtml(ambulanceIcon);
    this.EnfermoIcon = this.sanitizer.bypassSecurityTrustHtml(enfermoIcon);
    this.HospIcon = this.sanitizer.bypassSecurityTrustHtml(hospitalconsvg);
    this.ConsultasIcon = this.sanitizer.bypassSecurityTrustHtml(consultasIcon);
    this.ArchivoIcon = this.sanitizer.bypassSecurityTrustHtml(archivoIcon);
    this.CompartirIcon = this.sanitizer.bypassSecurityTrustHtml(compartirIcon);
    this.CalendarIcon = this.sanitizer.bypassSecurityTrustHtml(calendarIcon);


  }

  ngOnInit() {

    this.options = [
      { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: this.MenuIcon },
      { nombre: 'Pacientes', descripcion: 'Pacientes Registrados', ruta: '/pacientes', icon: this.PatienIcon },
      { nombre: 'Emergencia', descripcion: 'Emergencias Registradas', ruta: '/emergencia', icon: this.AmbulanceIcon },
      { nombre: 'Coex', descripcion: 'Consulta Externa Registradas', ruta: '/coex', icon: this.EnfermoIcon },
      { nombre: 'Ingresos', descripcion: 'Hospitalizaciones Registradas', ruta: '/ingreso', icon: this.HospIcon },
      { nombre: 'Consultas', descripcion: 'Todas las consultas registradas', ruta: '/consultas', icon: this.ConsultasIcon },
      { nombre: 'Recepcion', descripcion: 'Gestion de expedientes', ruta: '/recepcion', icon: this.ArchivoIcon },
      { nombre: 'Prestamo', descripcion: 'Gestor de expedientes prestados', ruta: '/prestamos', icon: this.CompartirIcon },
      { nombre: 'Citas', descripcion: 'Gestor de citas', ruta: '/citas', icon: this.CalendarIcon },

    ];



  }



}
