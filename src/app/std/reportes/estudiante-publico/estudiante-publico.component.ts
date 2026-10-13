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
/** Presenta el informe de consultas asociadas a estudiantes del sector público. */
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

  /** Desglose de cantidades por sexo con etiqueta legible y porcentaje. */
  get porSexo(): { sexo: string; etiqueta: string; total: number; porcentaje: number }[] {
    const lista: any[] = this.data?.por_sexo || [];
    const total = lista.reduce((acc, s) => acc + (s.total || 0), 0);
    return lista.map(s => ({
      sexo: s.sexo,
      etiqueta: this.etiquetaSexo(s.sexo),
      total: s.total ?? 0,
      porcentaje: total > 0 ? Math.round(((s.total || 0) / total) * 100) : 0,
    }));
  }

  private etiquetaSexo(sexo: string): string {
    switch ((sexo || '').toUpperCase()) {
      case 'M':
      case 'MASCULINO': return 'Masculino';
      case 'F':
      case 'FEMENINO': return 'Femenino';
      case 'N/D': return 'No especificado';
      default: return sexo || 'No especificado';
    }
  }
}
