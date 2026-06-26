import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';

@Component({
  selector: 'app-reportes-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h2>Reportes y Estadísticas</h2>
    <div class="aurora-container">
      <div
        class="aurora-cards"
        *ngFor="let opt of options"
        (click)="navegar(opt.ruta)"
      >
        <div class="aurora-items">
          <span [innerHTML]="icons[opt.icon]"></span>
          <h2>{{ opt.nombre }}</h2>
          <p>{{ opt.descripcion }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h2 { justify-content: center; color: aliceblue; text-align: center; margin: 24px 0 12px; }
  `]
})
export class ReportesInicioComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];
  icons: { [key: string]: SafeHtml } = {};

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private iconService: IconService
  ) {
    this.icons = {
      consultas: this.iconService.getIcon('consultasIcon'),
      baby: this.iconService.getIcon('babyIcon'),
      calendar: this.iconService.getIcon('calendarIcon'),
      doctor: this.iconService.getIcon('doctorIcon'),
      paciente: this.iconService.getIcon('patientIcon'),
      ingreso: this.iconService.getIcon('ingresoIcon'),
      archivo: this.iconService.getIcon('archivoIcon'),
      enfermo: this.iconService.getIcon('enfermoIcon'),
      compartir: this.iconService.getIcon('compartirIcon'),
      datos: this.iconService.getIcon('datosIcon'),
      medical: this.iconService.getIcon('medicalServiceIcon'),
    };
  }

  ngOnInit() {
    this.options = [
      { nombre: 'Pacientes Atendidos', descripcion: 'Por tipo consulta, especialidad y sexo', ruta: '/reportes/pacientes-atendidos', icon: 'consultas' },
      { nombre: 'Hospitalización Infantil', descripcion: '>28 días y <5 años por especialidad', ruta: '/reportes/hospitalizacion-infantil', icon: 'baby' },
      { nombre: 'Promedio Diario', descripcion: 'Promedio de consultas por especialidad', ruta: '/reportes/promedio-diario', icon: 'calendar' },
      { nombre: 'Personal del Hospital', descripcion: 'Consultas de personal del hospital', ruta: '/reportes/personal-hospital', icon: 'doctor' },
      { nombre: 'Estudiantes Públicos', descripcion: 'Consultas de estudiantes públicos', ruta: '/reportes/estudiante-publico', icon: 'paciente' },
      { nombre: 'Reingresos', descripcion: 'Reingresos hospitalarios con clasificación', ruta: '/reportes/reingresos', icon: 'ingreso' },
      { nombre: 'Reingresos Tipo 3', descripcion: 'Listado de reingresos tipo 3', ruta: '/reportes/reingresos-tipo3', icon: 'archivo' },
      { nombre: 'Activos >7 Días', descripcion: 'Consultas activas mayores a 7 días', ruta: '/reportes/activos-mayores-7-dias', icon: 'enfermo' },
      { nombre: 'Nacimientos', descripcion: 'Estadísticas de nacimientos', ruta: '/reportes/estadisticas-nacimientos', icon: 'compartir' },
      { nombre: 'Reporte Procedimientos', descripcion: 'Procedimientos agrupados', ruta: '/reportes/reporte-procedimientos', icon: 'datos' },
      { nombre: 'Resumen Procedimientos', descripcion: 'Resumen anual/mensual', ruta: '/reportes/resumen-procedimientos', icon: 'medical' },
    ];
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
