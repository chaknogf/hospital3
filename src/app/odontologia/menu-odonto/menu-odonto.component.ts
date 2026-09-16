
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { menuIcon, patientIcon, ambulanceIcon, enfermoIcon, hospitalconsvg, consultasIcon, archivoIcon, compartirIcon, calendarIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';


@Component({
  selector: 'app-menu-odonto',
  templateUrl: './menu-odonto.component.html',
  styleUrls: ['./menu-odonto.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})

export class MenuOdontoComponent implements OnInit {

  title = 'Odontología';
  subtitle = 'Consulta externa, citas y reportes de odontología';
  accent = '#f472b6';
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

      { nombre: 'Pacientes', descripcion: 'Pacientes y Consultas', ruta: '/consultar', icon: 'persons' },
      { nombre: 'COEX', descripcion: 'Consulta Externa de Odontología', ruta: '/coex-odonto', icon: 'cmedic' },
      { nombre: 'Citas', descripcion: 'Agendar y Consultar Citas', ruta: '/citas-odonto', icon: 'calendar' },
      { nombre: 'Reportes', descripcion: 'Reportes y estadísticas detalladas', ruta: '/reportes', icon: 'archivo' },


    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


}
