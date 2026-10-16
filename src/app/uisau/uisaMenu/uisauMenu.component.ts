
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, enfermoIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';


@Component({
  selector: 'app-uisauMenu',
  templateUrl: './uisauMenu.component.html',
  styleUrls: ['./uisauMenu.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})

/** Presenta las herramientas de consulta, encamamiento y reportes de UISAU. */
export class UisauMenuComponent implements OnInit {

  title = 'UISAU';
  subtitle = 'Unidad de Información en Salud al Usuario';
  accent = '#818cf8';
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
      notaUisau: this.iconService.getIcon("documentoIcon")

    }




  }

  ngOnInit() {

    this.options = [

      { nombre: 'Pacientes', descripcion: 'Buscar pacientes y gestionar notas', ruta: '/consultar', icon: 'persons' },
      { nombre: 'Lista', descripcion: 'Pacientes por servicio: COEX, Hospitalización y Emergencia', ruta: '/encamamiento', icon: 'ambulance' },
      { nombre: 'Nota', descripcion: 'Registrar nota y consultar la historia UISAU', ruta: '/notaUisau', icon: 'notaUisau' },
      { nombre: 'Estadisticas de Hospital', descripcion: 'Reportes y estadísticas detalladas', ruta: '/reportes', icon: 'archivo' },
      // { nombre: 'Informados', descripcion: 'Gestión de usuarios informados', ruta: '/informados', icon: '' },
    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
