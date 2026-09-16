
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';
@Component({
  selector: 'app-registrosMedicos',
  templateUrl: './registrosMedicos.component.html',
  styleUrls: ['./registrosMedicos.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]

})
export class RegistrosMedicosComponent implements OnInit {

  title = 'Registros Médicos';
  subtitle = 'Gestión de pacientes, consultas y expedientes clínicos';
  accent = '#3b82f6';
  menuColor = menuColor;

  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  // iconos
  icons: { [key: string]: any } = {};



  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private iconService: IconService
  ) {
    this.icons = {
      menu: this.iconService.getIcon("menuIcon"),
      paciente: this.iconService.getIcon("patientIcon"),
      ambulance: this.iconService.getIcon("ambulanceIcon"),
      cmedic: this.iconService.getIcon("consultaMedica"),
      ingresoIcon: this.iconService.getIcon("ingresoIcon"),
      consultas: this.iconService.getIcon("consultasIcon"),
      archivo: this.iconService.getIcon("archivoIcon"),
      compartir: this.iconService.getIcon("compartirIcon"),
      calendar: this.iconService.getIcon("calendarIcon"),
      baby: this.iconService.getIcon("babyIcon"),
      persons: this.iconService.getIcon("persons2"),
      doctor: this.iconService.getIcon("doctorIcon"),
      defuncion: this.iconService.getIcon("defuncionIcon")

    }




  }

  ngOnInit() {

    this.options = [

      { nombre: 'Pacientes', descripcion: 'Pacientes Registrados', ruta: '/pacientes', icon: 'persons' },
      { nombre: 'Consultas', descripcion: 'Todas las consultas registradas', ruta: '/consultas', icon: 'consultas' },
      { nombre: 'Emergencia', descripcion: 'Emergencias Registradas', ruta: '/emergencias', icon: 'ambulance' },
      { nombre: 'Coex', descripcion: 'Consulta Externa Registradas', ruta: '/coex', icon: 'cmedic' },
      { nombre: 'Ingresos', descripcion: 'Hospitalizaciones Registradas', ruta: '/ingresos', icon: 'ingresoIcon' },
      { nombre: 'Recepcion', descripcion: 'Gestion de expedientes', ruta: '/recepcion', icon: 'archivo' },
      { nombre: 'Prestamo', descripcion: 'Gestor de expedientes prestados', ruta: '/prestamos', icon: 'compartir' },
      { nombre: 'Expedientes', descripcion: 'Expedientes con/sin consulta reciente', ruta: '/expedientes', icon: 'archivo' },
      { nombre: 'Citas', descripcion: 'Gestor de citas', ruta: '/citas', icon: 'calendar' },
      { nombre: 'Nacimientos', descripcion: 'Constancias de nacimiento', ruta: '/nacimientos', icon: 'baby' },
      { nombre: 'Defunciones', descripcion: 'Informe de Defunción formato oficial', ruta: '/defunciones', icon: 'defuncion' },
      { nombre: 'Medicos', descripcion: 'Medicos Registrados', ruta: '/doctores', icon: 'doctor' },

    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
