import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { Especialidades } from '@enums/especialidades';

interface IndicadorItem {
  indicador: string;
  etiqueta: string;
  tipo_dato: string;
  clave_ausente: number;
  sin_valor: number;
  verdadero: number;
  falso: number;
  con_texto: number;
  valores_distintos: number;
  pacientes: number;
  porcentaje_consultas: number;
  porcentaje_pacientes: number;
  por_tipo_consulta: { tipo_consulta: number; tipo_consulta_nombre: string; total: number }[];
}

@Component({
  selector: 'app-indicadores-consultas',
  imports: [FormsModule, RouterLink],
  templateUrl: './indicadores-consultas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./indicadores-consultas.component.css']
})
/** Presenta el resumen de las banderas del jsonb `consultas.indicadores` por período. */
export class IndicadoresConsultasComponent implements OnInit {
  private api = inject(ApiService);

  data: any = null;
  datos: IndicadorItem[] = [];
  booleanos: IndicadorItem[] = [];
  textos: IndicadorItem[] = [];
  cargando = false;
  sincronizando = false;
  sync: any = null;
  error: string | null = null;

  desde = '';
  hasta = '';
  tipoConsulta: number | undefined = undefined;
  especialidad = '';

  readonly tiposConsulta = [
    { value: undefined, label: 'Todos' },
    { value: 1, label: 'COEX' },
    { value: 2, label: 'Hospitalización' },
    { value: 3, label: 'Emergencia' }
  ];

  readonly especialidades = Especialidades;

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
    this.api
      .getIndicadoresConsultas({
        desde: this.desde,
        hasta: this.hasta,
        tipo_consulta: this.tipoConsulta ?? null,
        especialidad: this.especialidad || null
      })
      .subscribe({
        next: (res) => {
          this.data = res;
          this.datos = res?.datos ?? [];
          this.booleanos = this.datos.filter(d => this.esBooleano(d));
          this.textos = this.datos.filter(d => !this.esBooleano(d));
          this.cargando = false;
        },
        error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
      });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.tipoConsulta = undefined;
    this.especialidad = '';
    this.sync = null;
    this.cargar();
  }

  /**
   * Escribe en cada consulta del periodo el `personal_hospital` del paciente y
   * funde el alias histórico `empleado_publico`.
   */
  sincronizar(): void {
    if (!this.desde || !this.hasta) {
      this.sync = { error: 'Define desde y hasta.' };
      return;
    }
    if (this.desde > this.hasta) {
      this.sync = { error: 'La fecha "desde" es posterior a "hasta".' };
      return;
    }
    this.sincronizando = true;
    this.api
      .sincronizarIndicadores(this.desde, this.hasta)
      .subscribe({
        next: (res) => {
          this.sync = res;
          this.sincronizando = false;
          this.cargar();
        },
        error: (err) => {
          this.sync = { error: err?.error?.detail || 'Error al sincronizar' };
          this.sincronizando = false;
        }
      });
  }

  esBooleano(item: IndicadorItem): boolean {
    return item.tipo_dato === 'booleano';
  }

  /** Barras proporcionales al porcentaje sobre las consultas del período. */
  pct(item: IndicadorItem, campo: 'porcentaje_consultas' | 'porcentaje_pacientes'): number {
    return Math.max(0, Math.min(100, Math.round(item[campo] ?? 0)));
  }
}