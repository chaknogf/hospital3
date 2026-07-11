import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { ConsultaListResponse } from '@models/consultas';

@Component({
  selector: 'app-reingresos-tipo3',
  imports: [FormsModule, RouterLink],
  templateUrl: './reingresos-tipo3.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./reingresos-tipo3.component.css']
})
export class ReingresosTipo3Component implements OnInit {
  private api = inject(ApiService);
  datos: ConsultaListResponse['consultas'] = [];
  cargando = true;
  error: string | null = null;
  total = 0;
  skip = 0;
  limit = 50;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getReingresosTipo3(this.skip, this.limit).subscribe({
      next: (res) => {
        this.datos = res?.consultas ?? [];
        this.total = res?.total ?? 0;
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }

  paginaSiguiente(): void {
    this.skip += this.limit;
    this.cargar();
  }

  paginaAnterior(): void {
    if (this.skip >= this.limit) {
      this.skip -= this.limit;
      this.cargar();
    }
  }

  get paginaActual(): number {
    return Math.floor(this.skip / this.limit) + 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }
}
