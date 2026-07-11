import { logoicon, rocketIcon } from './../../shared/icons/svg-icon';


import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { tarjetaPaciente, datosIcon } from '../../shared/icons/svg-icon';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})
export class DashboardComponent implements OnInit {

  modulos: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  private router = inject(Router);
  private iconS = inject(IconService);

  // iconos
  icons: { [key: string]: any } = {};

  constructor(

  ) {

    this.icons = {
      pacientes: this.iconS.getIcon("tarjetaPaciente"),
      datosIcon: this.iconS.getIcon("datosIcon"),
      logoicon: this.iconS.getIcon("logoicon"),
      rocket: this.iconS.getIcon("rocketIcon"),
      nutric: this.iconS.getIcon("nutritionIcon"),
      diente: this.iconS.getIcon("dienteIcon")

    }
  }



  ngOnInit() {

    this.modulos = [
      {
        nombre: 'Registros Medicos',
        descripcion: 'Gestión de pacientes y registros médicos',
        ruta: '/registros',
        icon: 'pacientes'
      },
      {
        nombre: 'UISAU',
        descripcion: 'Gestor de Atención al Usuario',
        ruta: '/uisau',
        icon: 'datosIcon'
      },

      {
        nombre: 'Trabajo Social',
        descripcion: 'Modulo de trabajo',
        ruta: '/TrabajoSocial',
        icon: 'logoicon'
      },
      // {
      //   nombre: 'Personal',
      //   descripcion: 'Administración del personal médico',
      //   ruta: '/personal'
      // },
      {
        nombre: 'Estadística',
        descripcion: 'Gestión de reportes y datos estadísticos',
        ruta: '/estadistica',
        icon: 'datosIcon'
      },
      // {
      //   nombre: 'Clínica',
      //   descripcion: 'Gestión de consulta médica',
      //   ruta: '/clinica',
      //   icon: 'datosIcon'
      // },
      // {
      //   nombre: 'Reportes y SIGSA',
      //   descripcion: 'Imprime reportes y sigsas',
      //   ruta: '/reportes',
      //   icon: 'datosIcon'
      // },
      {
        nombre: 'Nutrición',
        descripcion: 'Gestor de nutrición',
        ruta: '/menu-nutri',
        icon: 'nutric'
      },
      {
        nombre: 'Odontología',
        descripcion: 'Gestor de odontología',
        ruta: '/menu-odonto',
        icon: 'diente'
      },
      // {
      //   nombre: 'Laboratorio',
      //   descripcion: 'Gestor de laboratorio',
      //   ruta: '/laboratorio'
      // },
      // {
      //   nombre: 'Farmacia',
      //   descripcion: 'Gestor de farmacia',
      //   ruta: '/farmacia'
      // },
      // {
      //   nombre: 'Configuraciones',
      //   descripcion: 'Configuraciones del sistema',
      //   ruta: '/configuraciones'
      // },
      // {
      //   nombre: 'Usuarios',
      //   descripcion: 'Gestor de usuarios',
      //   ruta: '/usuarios'
      // },
      // {
      //   nombre: 'Salir',
      //   descripcion: 'Salir del sistema',
      //   ruta: '/inicio'
      // },
      {
        nombre: 'Huston',
        descripcion: 'Panel de Control',
        ruta: '/adminsys',
        icon: 'rocket'
      },
    ]
  }


  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

}

