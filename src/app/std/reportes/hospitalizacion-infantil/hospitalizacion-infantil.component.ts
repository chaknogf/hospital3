import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

interface EspRow {
  especialidad: string;
  M: number;
  F: number;
  total: number;
}

@Component({
  selector: 'app-hospitalizacion-infantil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hospitalizacion-infantil.component.html',
  styleUrls: ['./hospitalizacion-infantil.component.css']
})
export class HospitalizacionInfantilComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  cargando = false;
  error: string | null = null;
  desde = '';
  hasta = '';

  rows: EspRow[] = [];
  totalM = 0;
  totalF = 0;
  totalGeneral = 0;

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getHospitalizacionInfantil(this.desde, this.hasta).subscribe({
      next: (res) => {
        this.data = res;
        this.agrupar(res.datos || []);
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  private agrupar(datos: any[]): void {
    const espMap = new Map<string, EspRow>();

    for (const d of datos) {
      let row = espMap.get(d.especialidad);
      if (!row) {
        row = { especialidad: d.especialidad, M: 0, F: 0, total: 0 };
        espMap.set(d.especialidad, row);
      }
      const val = d.total ?? 0;
      if (d.sexo === 'M') row.M += val;
      if (d.sexo === 'F') row.F += val;
      row.total += val;
    }

    this.rows = [...espMap.values()].sort((a, b) => b.total - a.total);

    this.totalM = this.rows.reduce((s, r) => s + r.M, 0);
    this.totalF = this.rows.reduce((s, r) => s + r.F, 0);
    this.totalGeneral = this.rows.reduce((s, r) => s + r.total, 0);
  }
}
