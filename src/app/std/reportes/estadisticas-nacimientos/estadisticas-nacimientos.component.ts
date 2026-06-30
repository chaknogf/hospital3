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

  mortinatoRows: { estado: string; M: number; F: number; total: number }[] = [];
  mortinatoTotalM = 0;
  mortinatoTotalF = 0;
  mortinatoTotalGeneral = 0;

  fallecidosPosterioresRows: { estado: string; M: number; F: number; total: number }[] = [];
  fallecidosPosterioresTotalM = 0;
  fallecidosPosterioresTotalF = 0;
  fallecidosPosterioresTotalGeneral = 0;

  estadosCol: string[] = ['V', 'F'];
  clasePartoRows: { clase: string; Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }[] = [];
  cpColVivo = { M: 0, F: 0, total: 0 };
  cpColMortinato = { M: 0, F: 0, total: 0 };
  cpTotalGeneral = 0;

  clasifRows: { clasif: string; Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }[] = [];
  clasifColVivo = { M: 0, F: 0, total: 0 };
  clasifColMortinato = { M: 0, F: 0, total: 0 };
  clasifTotalGeneral = 0;

  trabajoRows: { trabajo: string; Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }[] = [];
  trabajoColVivo = { M: 0, F: 0, total: 0 };
  trabajoColMortinato = { M: 0, F: 0, total: 0 };
  trabajoTotalGeneral = 0;

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getEstadisticasNacimientos(this.desde, this.hasta).subscribe({
      next: (res) => {
        this.data = res;
        this.agruparMortinato(res.por_mortinato || []);
        this.agruparFallecidosPosteriores(res.por_fallecidos_posteriores || []);
        this.agruparClaseParto(res.por_clase_parto || []);
        this.agruparClasifParto(res.por_clasificacion_parto || []);
        this.agruparTrabajoParto(res.por_trabajo_parto || []);
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private agruparMortinato(datos: any[]): void {
    const estadoMap = new Map<string, { M: number; F: number; total: number }>();

    for (const d of datos) {
      const estado = d.estado || 'Vivo';
      let row = estadoMap.get(estado);
      if (!row) {
        row = { M: 0, F: 0, total: 0 };
        estadoMap.set(estado, row);
      }
      const val = d.total ?? 0;
      if (d.sexo === 'M') row.M += val;
      if (d.sexo === 'F') row.F += val;
      row.total += val;
    }

    this.mortinatoRows = [...estadoMap.entries()]
      .map(([k, v]) => ({ estado: k, ...v }));

    this.mortinatoTotalM = this.mortinatoRows.reduce((s, r) => s + r.M, 0);
    this.mortinatoTotalF = this.mortinatoRows.reduce((s, r) => s + r.F, 0);
    this.mortinatoTotalGeneral = this.mortinatoRows.reduce((s, r) => s + r.total, 0);
  }

  private agruparFallecidosPosteriores(datos: any[]): void {
    const estadoMap = new Map<string, { M: number; F: number; total: number }>();

    const labelMap: Record<string, string> = { V: 'Vivo', F: 'Fallecido' };
    for (const d of datos) {
      const estado = d.estado || 'V';
      let row = estadoMap.get(estado);
      if (!row) {
        row = { M: 0, F: 0, total: 0 };
        estadoMap.set(estado, row);
      }
      const val = d.total ?? 0;
      if (d.sexo === 'M') row.M += val;
      if (d.sexo === 'F') row.F += val;
      row.total += val;
    }

    this.fallecidosPosterioresRows = [...estadoMap.entries()]
      .map(([k, v]) => ({ estado: labelMap[k] || k, ...v }))
      .sort((a, b) => (a.estado === 'Fallecido' ? -1 : 1));

    this.fallecidosPosterioresTotalM = this.fallecidosPosterioresRows.reduce((s, r) => s + r.M, 0);
    this.fallecidosPosterioresTotalF = this.fallecidosPosterioresRows.reduce((s, r) => s + r.F, 0);
    this.fallecidosPosterioresTotalGeneral = this.fallecidosPosterioresRows.reduce((s, r) => s + r.total, 0);
  }

  private agruparClaseParto(datos: any[]): void {
    const claseMap = new Map<string, { Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.clase_parto || '—';
      let row = claseMap.get(key);
      if (!row) {
        row = { Vivo: zero(), Mortinato: zero(), total: 0 };
        claseMap.set(key, row);
      }
      const val = d.total ?? 0;
      const mortinato = (d.estado === 'Mortinato') ? 'Mortinato' : 'Vivo';
      if (d.sexo === 'M') row[mortinato].M += val;
      if (d.sexo === 'F') row[mortinato].F += val;
      row[mortinato].total += val;
      row.total += val;
    }

    this.clasePartoRows = [...claseMap.entries()]
      .map(([k, v]) => ({ clase: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.cpColVivo = { M: 0, F: 0, total: 0 };
    this.cpColMortinato = { M: 0, F: 0, total: 0 };
    this.cpTotalGeneral = 0;
    for (const r of this.clasePartoRows) {
      this.cpColVivo.M += r.Vivo.M; this.cpColVivo.F += r.Vivo.F; this.cpColVivo.total += r.Vivo.total;
      this.cpColMortinato.M += r.Mortinato.M; this.cpColMortinato.F += r.Mortinato.F; this.cpColMortinato.total += r.Mortinato.total;
      this.cpTotalGeneral += r.total;
    }
  }

  private agruparClasifParto(datos: any[]): void {
    const map = new Map<string, { Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.clasificacion_parto || '—';
      let row = map.get(key);
      if (!row) {
        row = { Vivo: zero(), Mortinato: zero(), total: 0 };
        map.set(key, row);
      }
      const val = d.total ?? 0;
      const mortinato = (d.estado === 'Mortinato') ? 'Mortinato' : 'Vivo';
      if (d.sexo === 'M') row[mortinato].M += val;
      if (d.sexo === 'F') row[mortinato].F += val;
      row[mortinato].total += val;
      row.total += val;
    }

    this.clasifRows = [...map.entries()]
      .map(([k, v]) => ({ clasif: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.clasifColVivo = { M: 0, F: 0, total: 0 };
    this.clasifColMortinato = { M: 0, F: 0, total: 0 };
    this.clasifTotalGeneral = 0;
    for (const r of this.clasifRows) {
      this.clasifColVivo.M += r.Vivo.M; this.clasifColVivo.F += r.Vivo.F; this.clasifColVivo.total += r.Vivo.total;
      this.clasifColMortinato.M += r.Mortinato.M; this.clasifColMortinato.F += r.Mortinato.F; this.clasifColMortinato.total += r.Mortinato.total;
      this.clasifTotalGeneral += r.total;
    }
  }

  private agruparTrabajoParto(datos: any[]): void {
    const map = new Map<string, { Vivo: { M: number; F: number; total: number }; Mortinato: { M: number; F: number; total: number }; total: number }>();

    const zero = () => ({ M: 0, F: 0, total: 0 });

    for (const d of datos) {
      const key = d.trabajo_parto || '—';
      let row = map.get(key);
      if (!row) {
        row = { Vivo: zero(), Mortinato: zero(), total: 0 };
        map.set(key, row);
      }
      const val = d.total ?? 0;
      const mortinato = (d.estado === 'Mortinato') ? 'Mortinato' : 'Vivo';
      if (d.sexo === 'M') row[mortinato].M += val;
      if (d.sexo === 'F') row[mortinato].F += val;
      row[mortinato].total += val;
      row.total += val;
    }

    this.trabajoRows = [...map.entries()]
      .map(([k, v]) => ({ trabajo: k, ...v }))
      .sort((a, b) => b.total - a.total);

    this.trabajoColVivo = { M: 0, F: 0, total: 0 };
    this.trabajoColMortinato = { M: 0, F: 0, total: 0 };
    this.trabajoTotalGeneral = 0;
    for (const r of this.trabajoRows) {
      this.trabajoColVivo.M += r.Vivo.M; this.trabajoColVivo.F += r.Vivo.F; this.trabajoColVivo.total += r.Vivo.total;
      this.trabajoColMortinato.M += r.Mortinato.M; this.trabajoColMortinato.F += r.Mortinato.F; this.trabajoColMortinato.total += r.Mortinato.total;
      this.trabajoTotalGeneral += r.total;
    }
  }
}
