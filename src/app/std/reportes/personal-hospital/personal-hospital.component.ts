import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-personal-hospital',
  imports: [FormsModule, RouterLink],
  templateUrl: './personal-hospital.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./personal-hospital.component.css']
})
export class PersonalHospitalComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  datos: any[] = [];
  cargando = false;
  error: string | null = null;
  desde = '';
  hasta = '';

  pagina = 1;
  porPagina = 10;
  totalRegistros = 0;

  get totalPaginas(): number {
    return Math.ceil(this.totalRegistros / this.pagina) || 1;
  }

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.pagina = 1;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    const skip = (this.pagina - 1) * this.porPagina;
    this.api.getPersonalHospital(this.desde, this.hasta, skip, this.porPagina).subscribe({
      next: (res) => {
        this.data = res;
        this.datos = res.datos || [];
        this.totalRegistros = res.total_general ?? this.datos.length;
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
    this.pagina = p;
    this.cargar();
  }
}
