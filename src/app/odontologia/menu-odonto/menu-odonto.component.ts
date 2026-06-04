import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, enfermoIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';


@Component({
  selector: 'app-menu-odonto',
  templateUrl: './menu-odonto.component.html',
  styleUrls: ['./menu-odonto.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})

export class MenuOdontoComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  // iconos
  icons: { [key: string]: any } = {};

  private router = inject(Router);
  private iconS = inject(IconService);


  constructor(

  ) {
    this.icons = {
      menu: this.iconS.getIcon("menuIcon"),
      paciente: this.iconS.getIcon("patientIcon"),
      ambulance: this.iconS.getIcon("ambulanceIcon"),
      cmedic: this.iconS.getIcon("consultaMedica"),
      ingresoIcon: this.iconS.getIcon("ingresoIcon"),
      consultas: this.iconS.getIcon("consultasIcon"),
      archivo: this.iconS.getIcon("archivoIcon"),
      compartir: this.iconS.getIcon("compartirIcon"),
      calendar: this.iconS.getIcon("calendarIcon"),
      baby: this.iconS.getIcon("babyIcon"),
      persons: this.iconS.getIcon("persons2"),
      doctor: this.iconS.getIcon("doctorIcon"),
      nutric: this.iconS.getIcon("nutritionIcon"),


    }




  }

  ngOnInit() {

    this.options = [

      { nombre: 'Pacientes', descripcion: 'Pacientes y Consultas', ruta: '/consultar', icon: 'persons' },
      { nombre: 'COEX', descripcion: 'Consulta Externa de Odontología', ruta: '/coex-odonto', icon: 'cmedic' },
      { nombre: 'Citas', descripcion: 'Agendar y Consultar Citas', ruta: '/citas-odonto', icon: 'calendar' },
      { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: 'menu' },

    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
