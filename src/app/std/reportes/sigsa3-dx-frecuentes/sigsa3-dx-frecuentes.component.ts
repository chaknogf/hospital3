// sigsa3-dx-frecuentes.component.ts

import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sigsa3Service } from '../../sigsa3/sigsa3.service';
import { Sigsa3DxItem } from '../../../interface/sigsa3.interface';

interface DxRow {
  dx: string;
  m: number;
  f: number;
  total: number;
}

interface TablaTC {
  tipoConsulta: string;
  rows: DxRow[];
  totalM: number;
  totalF: number;
  totalTabla: number;
}

interface EspecialidadGrupo {
  especialidad: string;
  tablas: TablaTC[];
  totalEspecialidad: number;
}

@Component({
  selector: 'app-sigsa3-dx-frecuentes',
  imports: [FormsModule, RouterLink],
  templateUrl: './sigsa3-dx-frecuentes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sigsa3-dx-frecuentes.component.css']
})
export class Sigsa3DxFrecuentesComponent implements OnInit {

  private api = inject(Sigsa3Service);

  data: any = null;
  datos: Sigsa3DxItem[] = [];
  cargando = false;
  error: string | null = null;
  desde = '';
  hasta = '';
  top = 10;

  tipoConsultaFilter: number | '' = '';
  especialidadFilter = '';
  especialidades: string[] = [];

  grupos: EspecialidadGrupo[] = [];
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
    const tc = this.tipoConsultaFilter !== '' ? Number(this.tipoConsultaFilter) : undefined;
    const esp = this.especialidadFilter || undefined;
    this.api.sigsa3DxFrecuentes(this.desde, this.hasta, this.top, tc, esp).subscribe({
      next: (res) => {
        this.data = res;
        this.datos = res.datos || [];
        this.totalGeneral = res.total_general || 0;
        this.extraerEspecialidades();
        this.construirGrupos();
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private extraerEspecialidades(): void {
    const set = new Set<string>();
    for (const d of this.datos) {
      if (d.especialidad) set.add(d.especialidad);
    }
    this.especialidades = [...set].sort();
  }

  private construirGrupos(): void {
    const espMap = new Map<string, Map<string, DxRow[]>>();

    for (const d of this.datos) {
      const esp = d.especialidad || 'Sin especialidad';
      const tc = d.tipo_consulta || 'Sin tipo';

      if (!espMap.has(esp)) espMap.set(esp, new Map());
      const tcMap = espMap.get(esp)!;
      if (!tcMap.has(tc)) tcMap.set(tc, []);

      tcMap.get(tc)!.push({
        dx: d.dx || '—',
        m: d.total_m || 0,
        f: d.total_f || 0,
        total: d.total,
      });
    }

    this.grupos = [...espMap.entries()]
      .map(([especialidad, tcMap]) => {
        const tablas: TablaTC[] = [];
        let totalEsp = 0;

        for (const [tc, itemsOriginal] of tcMap) {
          const rows = [...itemsOriginal].sort((a, b) => {
            if (a.dx === 'Resto de causas') return 1;
            if (b.dx === 'Resto de causas') return -1;
            return 0;
          });

          const totalM = rows.reduce((s, r) => s + r.m, 0);
          const totalF = rows.reduce((s, r) => s + r.f, 0);
          const totalTabla = totalM + totalF;
          totalEsp += totalTabla;

          tablas.push({ tipoConsulta: tc, rows, totalM, totalF, totalTabla });
        }

        tablas.sort((a, b) => b.totalTabla - a.totalTabla);

        return { especialidad, tablas, totalEspecialidad: totalEsp };
      })
      .sort((a, b) => b.totalEspecialidad - a.totalEspecialidad);
  }
}
