import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PatienIconComponent } from '../../icons-components/patienIcon/patienIcon.component';
import { AmbulanceIconComponent } from '../../icons-components/ambulanceIcon/ambulanceIcon.component';
import { EnfermoIconComponent } from '../../icons-components/enfermoIcon/enfermoIcon.component';
import { HospIconComponent } from '../../icons-components/hospIcon/hospIcon.component';
import { ArchivoIconComponent } from '../../icons-components/archivoIcon/archivoIcon.component';
import { MenuIconComponent } from '../../icons-components/menuIcon/menuIcon.component';
import { ConsultasIconComponent } from '../../icons-components/consultasIcon/consultasIcon.component';
import { CompartirIconComponent } from '../../icons-components/compartirIcon/compartirIcon.component';
import { CalendarIconComponent } from '../../icons-components/calendarIcon/calendarIcon.component';
@Component({
  selector: 'app-registrosMedicos',
  templateUrl: './registrosMedicos.component.html',
  styleUrls: ['./registrosMedicos.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, PatienIconComponent, AmbulanceIconComponent, EnfermoIconComponent, HospIconComponent, ArchivoIconComponent]

})
export class RegistrosMedicosComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {



  }

  options = [
    { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: MenuIconComponent },
    { nombre: 'Pacientes', descripcion: 'Pacientes Registrados', ruta: '/pacientes', icon: PatienIconComponent },
    { nombre: 'Emergencia', descripcion: 'Emergencias Registradas', ruta: '/emergencia', icon: AmbulanceIconComponent },
    { nombre: 'Coex', descripcion: 'Consulta Externa Registradas', ruta: '/coex', icon: EnfermoIconComponent },
    { nombre: 'Hospitalizaciones', descripcion: 'Hospitalizaciones Registradas', ruta: '/ingreso', icon: HospIconComponent },
    { nombre: 'Consultas', descripcion: 'Todas las consultas registradas', ruta: '/consultas', icon: ConsultasIconComponent },
    { nombre: 'Recepcion', descripcion: 'Gestion de expedientes', ruta: '/recepcion', icon: ArchivoIconComponent },
    { nombre: 'Prestamo', descripcion: 'Gestor de expedientes prestados', ruta: '/prestamos', icon: CompartirIconComponent },
    { nombre: 'Citas', descripcion: 'Gestor de citas', ruta: '/citas', icon: CalendarIconComponent },

  ];

}
