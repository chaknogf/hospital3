import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../../shared/module-menu';

interface OpcionEnfermeria {
  nombre: string;
  descripcion: string;
  ruta: string;
  icon: string;
}

/** Layout de Enfermería: barra lateral fija y área de contenido con rutas hijas. */
@Component({
  selector: 'app-menu-enfermeria',
  templateUrl: './menu-enfermeria.component.html',
  styleUrls: ['./menu-enfermeria.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule],
})
export class MenuEnfermeriaComponent {
  title = 'Enfermería';
  subtitle = 'Gestión paramédica';
  accent = '#5f72ed';
  menuColor = menuColor;

  sidebarAbierta = signal(false);

  readonly options: OpcionEnfermeria[] = [
    {
      nombre: 'Pacientes activos',
      descripcion: 'Listado por especialidad; registra nota o abre historia',
      ruta: 'pacientes-activos',
      icon: 'paciente',
    },
    {
      nombre: 'Notas médicas',
      descripcion: 'Selecciona una consulta y registra la evolución clínica',
      ruta: 'notas-medicas',
      icon: 'nota',
    },
    {
      nombre: 'Historia clínica',
      descripcion: 'Consulta ciclos, antecedentes y notas del expediente',
      ruta: 'historia-clinica',
      icon: 'historia',
    },
    {
      nombre: 'Quirófano',
      descripcion: 'Intervenciones quirúrgicas y pacientes hospitalizados',
      ruta: 'quirofano',
      icon: 'quirofano',
    },
    {
      nombre: 'Censo de Camas',
      descripcion: 'Gestión y registro del censo diario de camas',
      ruta: 'censo-camas',
      icon: 'cama',
    },
    {
      nombre: 'Medicamentos',
      descripcion: 'Gestión de inventario y administración de medicamentos',
      ruta: 'medicamentos',
      icon: 'medicina',
    },
    {
      nombre: 'Reportes',
      descripcion: 'Reportes y estadísticas detalladas',
      ruta: 'reportes',
      icon: 'archivo',
    },
  ];

  icons: Record<string, SafeHtml> = {};

  private iconS = inject(IconService);

  constructor() {
    this.icons = {
      menu: this.iconS.getIcon('menuIcon'),
      paciente: this.iconS.getIcon('patientIcon'),
      nota: this.iconS.getIcon('notaIcon'),
      historia: this.iconS.getIcon('historiaMedicaIcon'),
      quirofano: this.iconS.getIcon('ciruIcon'),
      cama: this.iconS.getIcon('censoCamasIcon'),
      medicina: this.iconS.getIcon('medicinaIcon'),
      archivo: this.iconS.getIcon('archivoIcon'),
      regresar: this.iconS.getIcon('backIcon'),
    };
  }

  alternarSidebar(): void {
    this.sidebarAbierta.update((abierta) => !abierta);
  }

  cerrarSidebar(): void {
    this.sidebarAbierta.set(false);
  }
}
