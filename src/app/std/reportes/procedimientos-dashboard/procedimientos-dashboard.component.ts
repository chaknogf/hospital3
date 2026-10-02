import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { StdService } from '../../std.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-procedimientos-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procedimientos-dashboard.component.html',
  styleUrls: ['./procedimientos-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ProcedimientosDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private stdService = inject(StdService);

  filtros: { desde: string; hasta: string; especialidad: string; lugar_servicio: string; sexo: string; nombre: string };

  cargando = false;
  error: string | null = null;

  // Vista pivote (reporte)
  totales: any = null;
  lugares: string[] = [];
  rows: { especialidad: string; lugares: { M: number; F: number; total: number }[]; total: number }[] = [];
  colTotales: { M: number; F: number; total: number }[] = [];
  totalGeneral = 0;

  // Vistas extra
  top5: Array<{ nombre: string; total_cantidad: number; total_anestesia: number; total?: number }> = [];
  registrosPorServicio: Array<{ lugar_servicio: string; total_registros: number }> = [];

  constructor() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtros = {
      desde: inicio.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0],
      especialidad: '',
      lugar_servicio: '',
      sexo: '',
      nombre: ''
    };
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    const f: any = {
      desde: this.filtros.desde || undefined,
      hasta: this.filtros.hasta || undefined,
      especialidad: this.filtros.especialidad?.trim() || undefined,
      lugar_servicio: this.filtros.lugar_servicio?.trim() || undefined,
      sexo: this.filtros.sexo || undefined,
      nombre: this.filtros.nombre?.trim() || undefined
    };

    // Cargar reporte
    this.api.getReporteProcedimientos(f).subscribe({
      next: (res) => {
        this.totales = res.totales || null;
        const grupos = res.grupos || [];
        this.agruparReporte(grupos);
        this.extraerResumen(grupos);
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar datos';
        this.cargando = false;
      }
    });

    // Cargar resumen (top 5) con mismos filtros
    this.api.getResumenProcedimientos(f).subscribe({
      next: (res) => {
        const top = res?.top_procedimientos || res?.resumen || [];
        this.top5 = top.map((p: any) => ({
          nombre: p.nombre,
          total_cantidad: p.total_cantidad ?? 0,
          total_anestesia: p.total_anestesia ?? 0,
          total: p.total
        }));
      },
      error: () => { /* opcional */ }
    });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtros = { desde: inicio.toISOString().split('T')[0], hasta: hoy.toISOString().split('T')[0], especialidad: '', lugar_servicio: '', sexo: '', nombre: '' };
    this.cargar();
  }

  private extraerResumen(grupos: any[]): void {
    const servicioMap = new Map<string, number>();
    for (const g of grupos) {
      const key = g.lugar_servicio || '—';
      servicioMap.set(key, (servicioMap.get(key) || 0) + (g.total_registros || 0));
    }
    this.registrosPorServicio = Array.from(servicioMap.entries())
      .map(([lugar_servicio, total_registros]) => ({ lugar_servicio, total_registros }))
      .sort((a, b) => b.total_registros - a.total_registros);
  }

  private agruparReporte(datos: any[]): void {
    const lugarSet = new Set<string>();
    const espSet = new Set<string>();
    for (const d of datos) {
      lugarSet.add(d.lugar_servicio || '—');
      espSet.add(d.especialidad || '—');
    }
    this.lugares = [...lugarSet].sort();
    const especialidades = [...espSet];
    this.rows = especialidades.map(esp => {
      const lugaresArr: { M: number; F: number; total: number }[] = [];
      let totalEsp = 0;
      for (const lug of this.lugares) {
        const m = datos.find(x => (x.especialidad || '—') === esp && (x.lugar_servicio || '—') === lug && x.sexo === 'M');
        const f = datos.find(x => (x.especialidad || '—') === esp && (x.lugar_servicio || '—') === lug && x.sexo === 'F');
        const t = {
          M: m?.total_cantidad ?? 0,
          F: f?.total_cantidad ?? 0,
          total: (m?.total_cantidad ?? 0) + (f?.total_cantidad ?? 0)
        };
        lugaresArr.push(t);
        totalEsp += t.total;
      }
      return { especialidad: esp, lugares: lugaresArr, total: totalEsp };
    }).sort((a, b) => b.total - a.total);

    this.colTotales = this.lugares.map((_, i) => {
      const M = this.rows.reduce((s, r) => s + r.lugares[i].M, 0);
      const F = this.rows.reduce((s, r) => s + r.lugares[i].F, 0);
      return { M, F, total: M + F };
    });
    this.totalGeneral = this.rows.reduce((s, r) => s + r.total, 0);
  }

  async descargarExcel(): Promise<void> {
    // Descargar todos los registros crudos con filtros aplicados
    const f: any = {
      fecha_inicio: this.filtros.desde || undefined,
      fecha_fin: this.filtros.hasta || undefined,
      especialidad: this.filtros.especialidad?.trim() || undefined,
      lugar_servicio: this.filtros.lugar_servicio?.trim() || undefined,
      skip: 0,
      limit: 100000
    };

    // Traemos todos los registros del listado de procedimientos
    this.stdService.getProcedimientos(f).subscribe({
      next: async (res) => {
        const registros = res?.procedimientos || [];
        if (!registros.length) {
          alert('No hay datos para exportar.');
          return;
        }

        const rows = registros.map((p: any) => ({
          Fecha: p.fecha,
          Especialidad: p.especialidad || '-',
          'Lugar/Servicio': p.lugar_servicio || '-',
          Sexo: p.sexo || '-',
          Cantidad: p.cantidad ?? 0,
          Anestesia: p.anestesia ?? 0,
          Procedimiento: p.procedimiento?.nombre || p.nombre || '-',
          'Código Procedimiento': p.procedimiento?.codigo || '-',
          'Tipo Procedimiento': p.procedimiento?.tipo || '-',
          Médico: p.medico?.nombre || p.personal_atencion || '-',
          'Cédula Médico': p.medico?.colegiado || '-',
          Observaciones: p.observaciones || '-'
        }));

        const { default: ExcelJS } = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Procedimientos');
        ws.columns = Object.keys(rows[0]).map(k => ({
          header: k,
          key: k,
          width: Math.max(k.length, 20)
        }));
        ws.addRows(rows);
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fechaDesde = this.filtros.desde || 'inicio';
        const fechaHasta = this.filtros.hasta || 'fin';
        a.download = `procedimientos_${fechaDesde}_${fechaHasta}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Error al exportar los datos');
      }
    });
  }
}
