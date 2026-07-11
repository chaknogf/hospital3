
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})
export class AdminComponent implements OnInit {

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
      persons: this.iconService.getIcon("persons2")

    }




  }

  ngOnInit() {

    this.options = [

      { nombre: 'Usuarios', descripcion: 'Gestionar Usuarios', ruta: '/usuarios', icon: '' },
      { nombre: 'Registrar', descripcion: 'Registrar Usuario', ruta: '/newuser', icon: '' },
      { nombre: 'Fusionar Pacientes', descripcion: 'Unir registros duplicados', ruta: '/merge-pacientes', icon: '' },
      { nombre: 'Desactivar Consulta', descripcion: 'Cambiar estado a descartado', ruta: '/desactivar-consulta', icon: '' },
      { nombre: 'Eliminar Consulta', descripcion: 'Eliminar consulta permanentemente', ruta: '/eliminar-consulta', icon: '' },
      { nombre: 'Eliminar Constancia', descripcion: 'Eliminar constancia de nacimiento', ruta: '/eliminar-constancia', icon: '' },
      { nombre: 'Municipios', descripcion: 'Gestionar catálogo de municipios', ruta: '/gestion-municipios', icon: '' },
      { nombre: 'Encamamiento', descripcion: 'Gestionar servicios y camas', ruta: '/gestion-encamamiento', icon: '' },
      { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: 'menu' },

    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
