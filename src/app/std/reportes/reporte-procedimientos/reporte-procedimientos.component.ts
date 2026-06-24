import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-reporte-procedimientos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reporte-procedimientos.component.html',
  styleUrls: ['./reporte-procedimientos.component.css']
})
export class ReporteProcedimientosComponent implements OnInit {
  private api = inject(ApiService);
  totales: any = null;
  cargando = false;
  error: string | null = null;

  filtros = { desde: '', hasta: '', especialidad: '', lugar_servicio: '', sexo: '' };

  lugares: string[] = [];
  rows: { especialidad: string; lugares: { M: number; F: number; total: number }[]; total: number }[] = [];
  colTotales: { M: number; F: number; total: number }[] = [];
  totalGeneral = 0;

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtros.desde = inicio.toISOString().split('T')[0];
    this.filtros.hasta = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getReporteProcedimientos(this.filtros).subscribe({
      next: (res) => {
        this.totales = res.totales || null;
        this.agrupar(res.grupos || []);
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private agrupar(datos: any[]): void {
    const lugarSet = new Set<string>();
    const espSet = new Set<string>();

    for (const d of datos) {
      lugarSet.add(d.lugar_servicio || '—');
      espSet.add(d.especialidad || '—');
    }

    this.lugares = [...lugarSet].sort();
    const especialidades = [...espSet];

    this.rows = especialidades.map(esp => {
      const lugares: { M: number; F: number; total: number }[] = [];
      let totalEsp = 0;

      for (const lug of this.lugares) {
        const m = datos.find(d => (d.especialidad || '—') === esp && (d.lugar_servicio || '—') === lug && d.sexo === 'M');
        const f = datos.find(d => (d.especialidad || '—') === esp && (d.lugar_servicio || '—') === lug && d.sexo === 'F');
        const t = {
          M: m?.total_cantidad ?? 0,
          F: f?.total_cantidad ?? 0,
          total: (m?.total_cantidad ?? 0) + (f?.total_cantidad ?? 0),
        };
        lugares.push(t);
        totalEsp += t.total;
      }

      return { especialidad: esp, lugares, total: totalEsp };
    }).sort((a, b) => b.total - a.total);

    this.colTotales = this.lugares.map((_, i) => {
      const M = this.rows.reduce((s, r) => s + r.lugares[i].M, 0);
      const F = this.rows.reduce((s, r) => s + r.lugares[i].F, 0);
      return { M, F, total: M + F };
    });

    this.totalGeneral = this.rows.reduce((s, r) => s + r.total, 0);
  }
}
