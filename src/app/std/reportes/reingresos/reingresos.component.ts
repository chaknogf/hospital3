import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-reingresos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reingresos.component.html',
  styleUrls: ['./reingresos.component.css']
})
export class ReingresosComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  datos: any[] = [];
  resumen: any = {};
  porEspecialidad: any[] = [];
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

  sum(key: string): number {
    return this.porEspecialidad.reduce((acc: number, e: any) => acc + (e[key] || 0), 0);
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getReingresos(this.desde, this.hasta).subscribe({
      next: (res) => { this.data = res; this.datos = res.datos || []; this.resumen = res.resumen || {}; this.porEspecialidad = res.por_especialidad || []; this.cargando = false; },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }
}
