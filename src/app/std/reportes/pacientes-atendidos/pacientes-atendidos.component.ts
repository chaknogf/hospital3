import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

interface TipoData {
  M: number;
  F: number;
  total: number;
}

interface EspecialidadRow {
  especialidad: string;
  tipos: TipoData[];
  totalEspecialidad: number;
}

@Component({
  selector: 'app-pacientes-atendidos',
  imports: [FormsModule, RouterLink],
  templateUrl: './pacientes-atendidos.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pacientes-atendidos.component.css']
})
export class PacientesAtendidosComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  datos: any[] = [];
  cargando = false;
  error: string | null = null;
  desde = '';
  hasta = '';

  tipoConsultas: string[] = [];
  rows: EspecialidadRow[] = [];
  totalesFila: TipoData[] = [];
  totalGeneral = 0;

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.api.getPacientesAtendidos(this.desde, this.hasta).subscribe({
      next: (res) => {
        this.data = res;
        this.datos = res.datos || [];
        this.agrupar();
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private agrupar(): void {
    const tipoMap = new Map<number, string>();
    const espSet = new Set<string>();

    for (const d of this.datos) {
      tipoMap.set(d.tipo_consulta, d.tipo_consulta_nombre);
      espSet.add(d.especialidad);
    }

    this.tipoConsultas = [...tipoMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, n]) => n);

    const especialidades = [...espSet];

    this.rows = especialidades
      .map(esp => {
        const tipos: TipoData[] = [];
        let totalEsp = 0;

        for (const tc of this.tipoConsultas) {
          const m = this.datos.find(d => d.especialidad === esp && d.tipo_consulta_nombre === tc && d.sexo === 'M');
          const f = this.datos.find(d => d.especialidad === esp && d.tipo_consulta_nombre === tc && d.sexo === 'F');
          const t: TipoData = { M: m?.total ?? 0, F: f?.total ?? 0, total: (m?.total ?? 0) + (f?.total ?? 0) };
          tipos.push(t);
          totalEsp += t.total;
        }

        return { especialidad: esp, tipos, totalEspecialidad: totalEsp };
      })
      .sort((a, b) => b.totalEspecialidad - a.totalEspecialidad);

    this.totalesFila = this.tipoConsultas.map((_, i) => {
      const M = this.rows.reduce((s, r) => s + r.tipos[i].M, 0);
      const F = this.rows.reduce((s, r) => s + r.tipos[i].F, 0);
      return { M, F, total: M + F };
    });

    this.totalGeneral = this.rows.reduce((s, r) => s + r.totalEspecialidad, 0);
  }
}
