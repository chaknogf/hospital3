// dx-z-cie10.component.ts

import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sigsa3Service } from '../../sigsa3/sigsa3.service';
import { Sigsa3DxZResponse, Sigsa3DxZItem } from '../../../interface/sigsa3.interface';

interface Z10PivotRow {
  tipo_consulta: string;
  z10_4: Sigsa3DxZItem | null;
  z10_5: Sigsa3DxZItem | null;
  z10_6: Sigsa3DxZItem | null;
  total: number;
  pacientes: number;
}

@Component({
  selector: 'app-dx-z-cie10',
  imports: [FormsModule, RouterLink],
  templateUrl: './dx-z-cie10.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./dx-z-cie10.component.css']
})
export class DxZCie10Component implements OnInit {

  private api = inject(Sigsa3Service);

  dataZ34: Sigsa3DxZResponse | null = null;
  dataZ10: Sigsa3DxZResponse | null = null;
  z10PivotRows: Z10PivotRow[] = [];
  z10TotalesPorCodigo = [0, 0, 0];
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

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.dataZ34 = null;
    this.dataZ10 = null;

    let completados = 0;
    const total = 2;

    const verificarListo = () => {
      completados++;
      if (completados === total) {
        this.cargando = false;
      }
    };

    this.api.sigsa3DxZ34(this.desde, this.hasta).subscribe({
      next: (res) => { this.dataZ34 = res; verificarListo(); },
      error: () => { this.error = 'Error al cargar diagnósticos Z:34'; this.cargando = false; }
    });

    this.api.sigsa3DxZ10(this.desde, this.hasta).subscribe({
      next: (res) => { this.dataZ10 = res; this.procesarPivotZ10(); verificarListo(); },
      error: () => { this.error = 'Error al cargar diagnósticos Z:10'; this.cargando = false; }
    });
  }

  private procesarPivotZ10(): void {
    if (!this.dataZ10) return;
    const datos = this.dataZ10.datos;
    const tipoMap = new Map<string, Z10PivotRow>();

    for (const d of datos) {
      const tc = d.tipo_consulta || 'Sin tipo';
      if (!tipoMap.has(tc)) {
        tipoMap.set(tc, { tipo_consulta: tc, z10_4: null, z10_5: null, z10_6: null, total: 0, pacientes: 0 });
      }
      const row = tipoMap.get(tc)!;
      if (d.codigo_cie_10 === 'Z:10:4') row.z10_4 = d;
      else if (d.codigo_cie_10 === 'Z:10:5') row.z10_5 = d;
      else if (d.codigo_cie_10 === 'Z:10:6') row.z10_6 = d;
      row.total += d.total;
      row.pacientes += d.pacientes;
    }

    this.z10PivotRows = [...tipoMap.values()].sort((a, b) => b.total - a.total);
    this.z10TotalesPorCodigo = [
      this.z10PivotRows.reduce((s, r) => s + (r.z10_4?.total ?? 0), 0),
      this.z10PivotRows.reduce((s, r) => s + (r.z10_5?.total ?? 0), 0),
      this.z10PivotRows.reduce((s, r) => s + (r.z10_6?.total ?? 0), 0),
    ];
  }
}
