import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-estadisticas-nacimientos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './estadisticas-nacimientos.component.html',
  styleUrls: ['./estadisticas-nacimientos.component.css']
})
export class EstadisticasNacimientosComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  cargando = false;
  error: string | null = null;
  desde = '';
  hasta = '';

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  sexoEstadoRows: { estado: string; M: number; F: number; total: number }[] = [];
  sexoEstadoTotalM = 0;
  sexoEstadoTotalF = 0;
  sexoEstadoTotalGeneral = 0;

  estadosCol: string[] = ['V', 'F'];
  clasePartoRows: { clase: string; V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }[] = [];
  cpColV = { M: 0, F: 0, total: 0 };
  cpColF = { M: 0, F: 0, total: 0 };
  cpTotalGeneral = 0;

  clasifRows: { clasif: string; V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }[] = [];
  clasifColV = { M: 0, F: 0, total: 0 };
  clasifColF = { M: 0, F: 0, total: 0 };
  clasifTotalGeneral = 0;

  trabajoRows: { trabajo: string; V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }[] = [];
  trabajoColV = { M: 0, F: 0, total: 0 };
  trabajoColF = { M: 0, F: 0, total: 0 };
  trabajoTotalGeneral = 0;

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getEstadisticasNacimientos(this.desde, this.hasta).subscribe({
      next: (res) => {
        this.data = res;
        this.agruparSexoEstado(res.por_sexo_estado || []);
        this.agruparClaseParto(res.por_clase_parto || []);
        this.agruparClasifParto(res.por_clasificacion_parto || []);
        this.agruparTrabajoParto(res.por_trabajo_parto || []);
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private agruparSexoEstado(datos: any[]): void {
    const estadoMap = new Map<string, { M: number; F: number; total: number }>();

    for (const d of datos) {
      let row = estadoMap.get(d.estado);
      if (!row) {
        row = { M: 0, F: 0, total: 0 };
        estadoMap.set(d.estado, row);
      }
      const val = d.total ?? 0;
      if (d.sexo === 'M') row.M += val;
      if (d.sexo === 'F') row.F += val;
      row.total += val;
    }

    const labelMap: Record<string, string> = { V: 'Vivo', F: 'Fallecido' };
    this.sexoEstadoRows = [...estadoMap.entries()]
      .map(([k, v]) => ({ estado: labelMap[k] || k, ...v }))
      .sort((a, b) => (a.estado === 'Vivo' ? -1 : 1));

    this.sexoEstadoTotalM = this.sexoEstadoRows.reduce((s, r) => s + r.M, 0);
    this.sexoEstadoTotalF = this.sexoEstadoRows.reduce((s, r) => s + r.F, 0);
    this.sexoEstadoTotalGeneral = this.sexoEstadoRows.reduce((s, r) => s + r.total, 0);
  }

  private agruparClaseParto(datos: any[]): void {
    const claseMap = new Map<string, { V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.clase_parto || '—';
      let row = claseMap.get(key);
      if (!row) {
        row = { V: zero(), F: zero(), total: 0 };
        claseMap.set(key, row);
      }
      const val = d.total ?? 0;
      const estado = d.estado as 'V' | 'F';
      if (d.sexo === 'M') row[estado].M += val;
      if (d.sexo === 'F') row[estado].F += val;
      row[estado].total += val;
      row.total += val;
    }

    this.clasePartoRows = [...claseMap.entries()]
      .map(([k, v]) => ({ clase: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.cpColV = { M: 0, F: 0, total: 0 };
    this.cpColF = { M: 0, F: 0, total: 0 };
    this.cpTotalGeneral = 0;
    for (const r of this.clasePartoRows) {
      this.cpColV.M += r.V.M; this.cpColV.F += r.V.F; this.cpColV.total += r.V.total;
      this.cpColF.M += r.F.M; this.cpColF.F += r.F.F; this.cpColF.total += r.F.total;
      this.cpTotalGeneral += r.total;
    }
  }

  private agruparClasifParto(datos: any[]): void {
    const map = new Map<string, { V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.clasificacion_parto || '—';
      let row = map.get(key);
      if (!row) {
        row = { V: zero(), F: zero(), total: 0 };
        map.set(key, row);
      }
      const val = d.total ?? 0;
      const estado = d.estado as 'V' | 'F';
      if (d.sexo === 'M') row[estado].M += val;
      if (d.sexo === 'F') row[estado].F += val;
      row[estado].total += val;
      row.total += val;
    }

    this.clasifRows = [...map.entries()]
      .map(([k, v]) => ({ clasif: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.clasifColV = { M: 0, F: 0, total: 0 };
    this.clasifColF = { M: 0, F: 0, total: 0 };
    this.clasifTotalGeneral = 0;
    for (const r of this.clasifRows) {
      this.clasifColV.M += r.V.M; this.clasifColV.F += r.V.F; this.clasifColV.total += r.V.total;
      this.clasifColF.M += r.F.M; this.clasifColF.F += r.F.F; this.clasifColF.total += r.F.total;
      this.clasifTotalGeneral += r.total;
    }
  }

  private agruparTrabajoParto(datos: any[]): void {
    const map = new Map<string, { V: { M: number; F: number; total: number }; F: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.trabajo_parto || '—';
      let row = map.get(key);
      if (!row) {
        row = { V: zero(), F: zero(), total: 0 };
        map.set(key, row);
      }
      const val = d.total ?? 0;
      const estado = d.estado as 'V' | 'F';
      if (d.sexo === 'M') row[estado].M += val;
      if (d.sexo === 'F') row[estado].F += val;
      row[estado].total += val;
      row.total += val;
    }

    this.trabajoRows = [...map.entries()]
      .map(([k, v]) => ({ trabajo: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.trabajoColV = { M: 0, F: 0, total: 0 };
    this.trabajoColF = { M: 0, F: 0, total: 0 };
    this.trabajoTotalGeneral = 0;
    for (const r of this.trabajoRows) {
      this.trabajoColV.M += r.V.M; this.trabajoColV.F += r.V.F; this.trabajoColV.total += r.V.total;
      this.trabajoColF.M += r.F.M; this.trabajoColF.F += r.F.F; this.trabajoColF.total += r.F.total;
      this.trabajoTotalGeneral += r.total;
    }
  }
}
