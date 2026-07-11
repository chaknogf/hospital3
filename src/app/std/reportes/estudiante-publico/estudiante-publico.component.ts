import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-estudiante-publico',
  imports: [FormsModule, RouterLink],
  templateUrl: './estudiante-publico.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./estudiante-publico.component.css']
})
export class EstudiantePublicoComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  datos: any[] = [];
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
    this.cargando = true; this.error = null;
    this.api.getEstudiantePublico(this.desde, this.hasta).subscribe({
      next: (res) => { this.data = res; this.datos = res.datos || []; this.cargando = false; },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }
}
