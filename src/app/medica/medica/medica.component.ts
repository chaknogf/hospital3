import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';


/** Menú de acceso a las funciones de atención médica. */
@Component({
  selector: 'app-medica',
  templateUrl: './medica.component.html',
  styleUrls: ['./medica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
})
export class MedicaComponent implements OnInit {

  title = 'Consulta Médica';
  subtitle = 'Atención médica: pacientes, signos vitales, notas y órdenes';
  accent = '#34d399';
  menuColor = menuColor;

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
      quirofano: this.iconService.getIcon("medicalServiceIcon"),

    }




  }

  ngOnInit() {

    this.options = [
      {
        nombre: 'Pacientes activos',
        descripcion: 'Listado por especialidad; registra nota o abre historia',
        ruta: '/pacientesActivos',
        icon: 'paciente',
      },
      {
        nombre: 'Notas médicas',
        descripcion: 'Selecciona una consulta y registra la evolución clínica',
        ruta: '/notaMedica',
        icon: 'nota',
      },
      {
        nombre: 'Historia clínica',
        descripcion: 'Consulta ciclos, antecedentes y notas del expediente',
        ruta: '/historiaClinica',
        icon: 'paciente',
      },
      {
        nombre: 'Quirófano',
        descripcion: 'Intervenciones quirúrgicas y pacientes hospitalizados',
        ruta: '/quirofano',
        icon: 'quirofano',
      },
    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
