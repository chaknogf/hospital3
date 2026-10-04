import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StdService } from '../../std.service';
import { EspecialidadesService } from '../../../service/especialidades.service';
import {
  GrupoEdad,
  GrupoEdadItem,
  ProcedimientoMasUsado
} from '../../../interface/procedimientos';

interface FilaHoja {
  posicion: number;
  nombre: string;
  abreviatura: string;
  /** true en las filas que se entregan vacías para llenar a mano. */
  vacia: boolean;
  id_catalogo_procedimiento: number | null;
}

/**
 * Genera la hoja con los procedimientos más usados de una especialidad para
 * imprimirla en tamaño carta horizontal y llenarla a mano. Debajo de los más
 * frecuentes se agregan filas vacías para anotar los que no alcancen el corte.
 */
@Component({
  selector: 'app-captura-procedimientos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './captura-procedimientos.component.html',
  styleUrls: ['./captura-procedimientos.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CapturaProcedimientosComponent implements OnInit {

  private stdService = inject(StdService);
  private especialidadesApi = inject(EspecialidadesService);

  readonly GRUPOS: GrupoEdad[] = ['NEO', 'LAC', 'PRI', 'SEG', 'ADO', 'ADU', 'ADM'];
  /** Renglones en blanco al final de la hoja. */
  readonly FILAS_VACIAS = 10;

  gruposEdad: GrupoEdadItem[] = [];
  especialidades: any[] = [];

  cargando = false;
  /** Ya se consultó la especialidad: habilita la impresión aunque no haya datos. */
  cargado = false;
  error: string | null = null;
  aviso: string | null = null;

  especialidadId: number | null = null;
  desde = '';
  hasta = '';
  limite = 10;

  filas: FilaHoja[] = [];
  /** Al imprimir se congela el listado para que la hoja sea un comprobante. */
  impreso: {
    especialidad: string;
    desde: string;
    hasta: string;
    filas: FilaHoja[];
    generado: string;
  } | null = null;

  ngOnInit(): void {
    this.especialidadesApi.getEspecialidades(true, true).subscribe({
      next: d => {
        this.especialidades = d;
        if (d.length && this.especialidadId == null) {
          this.especialidadId = d[0].id;
        }
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudieron cargar las especialidades.';
      }
    });

    this.stdService.getGruposEdad().subscribe({
      next: d => this.gruposEdad = d,
      error: err => console.error(err)
    });
  }

  cargar(): void {
    if (this.especialidadId == null) {
      alert('Seleccione una especialidad.');
      return;
    }
    if (this.desde && this.hasta && this.desde > this.hasta) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return;
    }

    this.cargando = true;
    this.cargado = false;
    this.error = null;
    this.aviso = null;

    this.stdService.getMasUsados({
      especialidad_id: this.especialidadId,
      desde: this.desde || undefined,
      hasta: this.hasta || undefined,
      limite: this.limite
    }).subscribe({
      next: res => {
        const masUsados = res?.procedimientos || [];
        this.filas = [
          ...masUsados.map(p => ({
            posicion: p.posicion,
            nombre: p.nombre,
            abreviatura: p.abreviatura || '',
            vacia: false,
            id_catalogo_procedimiento: p.id_catalogo_procedimiento
          })),
          ...this.filasEnBlanco(masUsados.length)
        ];
        this.cargando = false;
        this.cargado = true;
        if (!masUsados.length) {
          this.aviso =
            'Esta especialidad no tiene procedimientos registrados en el período. La hoja se imprime solo con las filas en blanco.';
        }
      },
      error: err => {
        console.error(err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los procedimientos.';
      }
    });
  }

  /** Renglones vacíos para anotar procedimientos que no entran en el corte. */
  private filasEnBlanco(desdePosicion: number): FilaHoja[] {
    const out: FilaHoja[] = [];
    for (let i = 0; i < this.FILAS_VACIAS; i++) {
      out.push({
        posicion: desdePosicion + i + 1,
        nombre: '',
        abreviatura: '',
        vacia: true,
        id_catalogo_procedimiento: null
      });
    }
    return out;
  }

  get totalFila(): number {
    return this.filas.length;
  }

  get filasConDatos(): number {
    return this.filas.filter(f => !f.vacia).length;
  }

  nombreEspecialidad(): string {
    return this.especialidades.find(e => e.id === this.especialidadId)?.nombre || '';
  }

  /** Rango legible para el encabezado de la hoja. */
  rango(): string {
    if (this.desde && this.hasta) return `${this.desde} al ${this.hasta}`;
    if (this.desde) return `desde ${this.desde}`;
    if (this.hasta) return `hasta ${this.hasta}`;
    return 'todo el histórico';
  }

  /** Congela el listado y lanza el diálogo de impresión del navegador. */
  imprimir(): void {
    if (!this.cargado) {
      alert('Primero cargue los procedimientos.');
      return;
    }

    this.impreso = {
      especialidad: this.nombreEspecialidad(),
      desde: this.desde,
      hasta: this.hasta,
      filas: this.filas.map(f => ({ ...f })),
      generado: new Date().toLocaleString('es-GT')
    };

    setTimeout(() => window.print(), 60);
  }
}