import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

interface ReporteOption {
  ruta: string;
  icono: string;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {
  private router = inject(Router);
  reportes: ReporteOption[] = [
    { ruta: '/reportes/pacientes-atendidos', icono: '📊', nombre: 'Pacientes Atendidos', descripcion: 'Por tipo consulta, especialidad y sexo' },
    { ruta: '/reportes/hospitalizacion-infantil', icono: '👶', nombre: 'Hospitalización Infantil', descripcion: '>28 días y <5 años por especialidad' },
    { ruta: '/reportes/promedio-diario', icono: '📅', nombre: 'Promedio Diario', descripcion: 'Promedio de consultas por especialidad' },
    { ruta: '/reportes/personal-hospital', icono: '🏥', nombre: 'Personal del Hospital', descripcion: 'Consultas de personal del hospital' },
    { ruta: '/reportes/estudiante-publico', icono: '🎓', nombre: 'Estudiantes Públicos', descripcion: 'Consultas de estudiantes públicos' },
    { ruta: '/reportes/reingresos', icono: '🔄', nombre: 'Reingresos', descripcion: 'Reingresos hospitalarios con clasificación' },
    { ruta: '/reportes/reingresos-tipo3', icono: '📋', nombre: 'Reingresos Tipo 3', descripcion: 'Listado de reingresos tipo 3' },
    { ruta: '/reportes/activos-mayores-7-dias', icono: '⏳', nombre: 'Activos >7 Días', descripcion: 'Consultas activas mayores a 7 días' },
    { ruta: '/reportes/estadisticas-nacimientos', icono: '🍼', nombre: 'Nacimientos', descripcion: 'Estadísticas de nacimientos' },
    { ruta: '/reportes/reporte-procedimientos', icono: '🔧', nombre: 'Reporte Procedimientos', descripcion: 'Procedimientos agrupados' },
    { ruta: '/reportes/resumen-procedimientos', icono: '📈', nombre: 'Resumen Procedimientos', descripcion: 'Resumen anual/mensual de procedimientos' },
    { ruta: '/reportes/sigsa3-estadistica', icono: '📊', nombre: 'SIGSA-3 por Especialidad', descripcion: 'Consultas SIGSA-3 por especialidad, tipo y sexo' },
    { ruta: '/reportes/sigsa3-dx-frecuentes', icono: '🔬', nombre: 'SIGSA-3 Dx Frecuentes', descripcion: 'Top 10 diagnósticos más frecuentes por especialidad' },
    { ruta: '/reportes/dx-z-cie10', icono: '📋', nombre: 'Diagnósticos CIE-10 Z', descripcion: 'Filtrar por códigos Z:34 y Z:10 entre fechas' },
  ];

  regresar(): void {
    this.router.navigate(['/dash']);
  }
}
