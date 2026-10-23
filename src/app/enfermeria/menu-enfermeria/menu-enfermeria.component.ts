
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, enfermoIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';


/** Menú de acceso a citas y consultas de odontología. */
@Component({
  selector: 'app-menu-enfermeria',
  templateUrl: './menu-enfermeria.component.html',
  styleUrls: ['./menu-enfermeria.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})

export class MenuEnfermeriaComponent implements OnInit {

  title = 'Enfermería';
  subtitle = 'Gestión paramédica';
  accent = '#5f72ed';
  menuColor = menuColor;

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
      {
        nombre: 'Censo de Camas',
        descripcion: 'Gestión y registro del censo diario de camas',
        ruta: '/censo-camas',
        icon: 'cama'
      },
      {
        nombre: 'Medicamentos',
        descripcion: 'Gestión de inventario y administración de medicamentos',
        ruta: '/medicamentos',
        icon: 'medicina'
      },
      {
        nombre: 'Reportes',
        descripcion: 'Reportes y estadísticas detalladas',
        ruta: '/reportes',
        icon: 'archivo'
      },



    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
