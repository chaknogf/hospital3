import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { InsumosService } from '../../../insumos/insumos.service';
import { Despacho, Kardex } from '../../../insumos/insumos.model';
import {
  DocumentoImpresionComponent,
  DocumentoMeta,
} from '../documento-impresion.component';
import { cargarTodasLasPaginas } from '../paginacion';

interface Kpi {
  etiqueta: string;
  valor: string | number;
}

/**
 * Informe imprimible por periodo: combina despachos y movimientos de kardex
 * del mismo rango de fechas en un solo documento con resumen y detalle.
 */
@Component({
  selector: 'app-informe-periodo',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentoImpresionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-documento-impresion
    titulo="Informe de farmacia por periodo"
    [subtitulo]="subtitulo()"
    [meta]="meta()"
    [firmas]="firmas"
  >
    <div doc-controles class="doc-print-filtros">
      <label class="doc-print-campo">
        Desde
        <input type="date" [(ngModel)]="filtros.desde" name="informe-desde" />
      </label>
      <label class="doc-print-campo">
        Hasta
        <input type="date" [(ngModel)]="filtros.hasta" name="informe-hasta" />
      </label>
      <button
        type="button"
        class="doc-print-btn doc-print-btn--primary"
        (click)="cargar()"
        [disabled]="cargando()"
      >
        {{ cargando() ? 'Generando…' : 'Generar informe' }}
      </button>
    </div>

    @if (error()) {
      <p class="doc-print-note" role="alert">{{ error() }}</p>
    } @else if (cargando()) {
      <p class="doc-print-note">Generando el informe del periodo…</p>
    } @else {
      <section class="doc-print-section">
        <h2 class="doc-print-section-title">Resumen del periodo</h2>
        <div class="doc-print-grid">
          @for (kpi of resumen(); track kpi.etiqueta) {
            <div class="doc-print-kpi">
              <p class="doc-print-kpi-label">{{ kpi.etiqueta }}</p>
              <p class="doc-print-kpi-value">{{ kpi.valor }}</p>
            </div>
          }
        </div>
      </section>

      <section class="doc-print-section">
        <h2 class="doc-print-section-title">Despachos del periodo</h2>
        @if (despachos().length) {
          <table class="doc-print-table">
            <thead>
              <tr>
                <th scope="col">Número</th>
                <th scope="col">Fecha</th>
                <th scope="col">Tipo</th>
                <th scope="col">Destino</th>
                <th scope="col">Estado</th>
                <th scope="col" class="num">Líneas</th>
                <th scope="col" class="num">Unidades</th>
              </tr>
            </thead>
            <tbody>
              @for (d of despachos(); track d.id) {
                <tr>
                  <td class="nowrap">{{ d.numero }}</td>
                  <td class="nowrap">{{ d.fecha | date:'dd/MM/yy HH:mm' }}</td>
                  <td class="nowrap">{{ tipoTexto(d.tipo) }}</td>
                  <td>{{ destinoTexto(d) }}</td>
                  <td class="nowrap">{{ estadoTexto(d.estado) }}</td>
                  <td class="num">{{ d.detalles?.length || 0 }}</td>
                  <td class="num">{{ unidades(d) | number:'1.0-2' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Total</td>
                <td class="num">{{ totalLineas() }}</td>
                <td class="num">{{ totalUnidades() | number:'1.0-2' }}</td>
              </tr>
            </tfoot>
          </table>
        } @else {
          <p class="doc-print-empty">No hay despachos registrados en el periodo.</p>
        }
      </section>

      <section class="doc-print-section">
        <h2 class="doc-print-section-title">Movimientos de kardex</h2>
        @if (kardex().length) {
          <table class="doc-print-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Insumo</th>
                <th scope="col">Lote</th>
                <th scope="col">Almacén</th>
                <th scope="col">Tipo</th>
                <th scope="col" class="num">Cantidad</th>
                <th scope="col" class="num">Saldo</th>
              </tr>
            </thead>
            <tbody>
              @for (k of kardex(); track k.id) {
                <tr>
                  <td class="nowrap">{{ k.fecha | date:'dd/MM/yy HH:mm' }}</td>
                  <td>
                    {{ k.insumo_nombre || 'Insumo sin nombre' }}
                    @if (k.presentacion_nombre) {
                      <span class="doc-print-desglose">{{ k.presentacion_nombre }}</span>
                    }
                  </td>
                  <td class="nowrap">{{ k.lote_numero || '—' }}</td>
                  <td>{{ k.almacen_nombre || '—' }}</td>
                  <td class="nowrap">{{ tipoMovimientoTexto(k.tipo_movimiento) }}</td>
                  <td class="num">{{ k.cantidad | number:'1.0-2' }}</td>
                  <td class="num">{{ k.saldo_resultante | number:'1.0-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="doc-print-empty">No hay movimientos de kardex en el periodo.</p>
        }
      </section>
    }
  </app-documento-impresion>
  `,
})
export class InformePeriodoComponent implements OnInit {
  private svc = inject(InsumosService);

  readonly despachos = signal<Despacho[]>([]);
  readonly kardex = signal<Kardex[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  filtros = {
    desde: inicioDeMes(),
    hasta: hoyISO(),
  };

  readonly firmas = [
    'Elaborado por — Farmacia',
    'Revisado por — Jefatura de Farmacia',
    'Vo.Bo. — Dirección',
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');

    const hasta = sumarDia(this.filtros.hasta);
    const base = { desde: this.filtros.desde, hasta };

    forkJoin({
      despachos: cargarTodasLasPaginas<Despacho>(
        (p) => this.svc.listarDespachos(p),
        { ...base, activo: true },
      ),
      kardex: cargarTodasLasPaginas<Kardex>(
        (p) => this.svc.listarKardex(p),
        base,
      ),
    }).subscribe({
      next: ({ despachos, kardex }) => {
        this.despachos.set(despachos);
        this.kardex.set(kardex);
        this.cargando.set(false);
      },
      error: () => {
        this.despachos.set([]);
        this.kardex.set([]);
        this.cargando.set(false);
        this.error.set('No se pudo generar el informe del periodo.');
      },
    });
  }

  subtitulo(): string {
    return `Del ${fechaCorta(this.filtros.desde)} al ${fechaCorta(this.filtros.hasta)}`;
  }

  meta(): DocumentoMeta[] {
    return [
      { etiqueta: 'Despachos', valor: String(this.despachos().length) },
      { etiqueta: 'Movimientos', valor: String(this.kardex().length) },
    ];
  }

  resumen(): Kpi[] {
    const despachos = this.despachos();
    return [
      { etiqueta: 'Despachos', valor: despachos.length },
      {
        etiqueta: 'Ejecutados',
        valor: despachos.filter((d) => d.estado === 'despachado').length,
      },
      { etiqueta: 'Unidades despachadas', valor: this.totalUnidades() },
      { etiqueta: 'Movimientos de kardex', valor: this.kardex().length },
    ];
  }

  unidades(d: Despacho): number {
    return (d.detalles ?? []).reduce(
      (total, det) => total + Number(det.cantidad || 0),
      0,
    );
  }

  totalUnidades(): number {
    return this.despachos().reduce((total, d) => total + this.unidades(d), 0);
  }

  totalLineas(): number {
    return this.despachos().reduce(
      (total, d) => total + (d.detalles?.length || 0),
      0,
    );
  }

  tipoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      servicio: 'Servicio',
      paciente: 'Paciente',
      traslado: 'Traslado',
    };
    return etiquetas[tipo] || tipo;
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      borrador: 'Borrador',
      despachado: 'Despachado',
      anulado: 'Anulado',
    };
    return etiquetas[estado] || estado;
  }

  tipoMovimientoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      entrada: 'Entrada',
      salida: 'Salida',
      traslado: 'Traslado',
      consumo: 'Consumo',
      ajuste: 'Ajuste',
    };
    return etiquetas[tipo] || tipo;
  }

  destinoTexto(d: Despacho): string {
    if (d.tipo === 'traslado') return d.almacen_destino_nombre || 'Almacén sin nombre';
    if (d.tipo === 'paciente') return d.paciente_nombre || 'Paciente sin nombre';
    return d.servicio_destino_nombre || 'Servicio sin nombre';
  }
}

/** Fecha local en formato `YYYY-MM-DD` (sin desfase por zona horaria). */
function fechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const d = `${fecha.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hoyISO(): string {
  return fechaISO(new Date());
}

function inicioDeMes(): string {
  const hoy = new Date();
  return fechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}

/** Suma un día a una fecha `YYYY-MM-DD` para que el rango sea inclusivo. */
function sumarDia(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  if (!y || !m || !d) return fecha;
  const siguiente = new Date(y, m - 1, d);
  siguiente.setDate(siguiente.getDate() + 1);
  return fechaISO(siguiente);
}

function fechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '—';
}
