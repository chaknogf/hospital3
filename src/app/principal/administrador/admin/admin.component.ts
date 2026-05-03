import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
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
      { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: 'menu' },

    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
