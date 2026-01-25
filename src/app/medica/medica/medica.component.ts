import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconService } from '../../service/icon.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medica',
  templateUrl: './medica.component.html',
  styleUrls: ['./medica.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MedicaComponent implements OnInit {

  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  // iconos
  icons: { [key: string]: any } = {};



  constructor(
    private router: Router,
    private iconService: IconService
  ) {
    this.icons = {
      menu: this.iconService.getIcon("menuPuntos"),
      paciente: this.iconService.getIcon("patientIcon"),
      signosVitales: this.iconService.getIcon("signosVitalesicon"),
      nota: this.iconService.getIcon("notaMedica"),
      ordenes: this.iconService.getIcon("ordenesMedicas"),

    }




  }

  ngOnInit() {

    this.options = [
      {
        nombre: 'Menu',
        descripcion: 'Regresar al menu principal',
        ruta: '/dash',
        icon: 'menu'
      },
      { nombre: 'Pacientes', descripcion: 'Pacientes admitidos y consultantes', ruta: '/pacientesAtendidos', icon: 'paciente' },
      { nombre: 'Signos Vitales', descripcion: 'Registrar Signos Vitales', ruta: '/signos-vitales', icon: 'signosVitales' },
      { nombre: 'Nota Medica', descripcion: 'Impresión Médica, evolución, procedimientos realizados', ruta: '/notas-medicas', icon: 'nota' },
      { nombre: 'Ordenes Medicas', descripcion: 'Ordenes de Estudios y otros', ruta: '/ordenes', icon: 'ordenes' },
      //{ nombre: 'Resultados', descripcion: 'Resultados del Paciente', ruta: '', icon: 'consultas' },


    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
