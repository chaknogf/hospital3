import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InsumosService } from '../../../insumos/insumos.service';
import { Kardex } from '../../../insumos/insumos.model';
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
 * Kardex imprimible por periodo.
 *
 * Reutiliza el shell de documentos y pagina el endpoint hasta agotar el
 * rango, de modo que el reporte incluye todos los movimientos y no solo los
 * primeros 200.
 */
@Component({
  selector: 'app-kardex-impresion',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentoImpresionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-documento-impresion
    titulo="Kardex de movimientos"
    [subtitulo]="subtitulo()"
    [meta]="meta()"
    [firmas]="firmas"
  >
    <div doc-controles class="doc-print-filtros">
      <label class="doc-print-campo">
        Desde
        <input type="date" [(ngModel)]="filtros.desde" name="kardex-desde" />
      </label>
      <label class="doc-print-campo">
        Hasta
        <input type="date" [(ngModel)]="filtros.hasta" name="kardex-hasta" />
      </label>
      <label class="doc-print-campo">
        Tipo de movimiento
        <select [(ngModel)]="filtros.tipo_movimiento" name="kardex-tipo">
          <option value="">Todos</option>
          @for (t of tipos; track t.valor) {
            <option [value]="t.valor">{{ t.etiqueta }}</option>
          }
        </select>
      </label>
      <label class="doc-print-campo">
        Documento origen
        <select [(ngModel)]="filtros.referencia_tipo" name="kardex-referencia">
          <option value="">Todos</option>
          @for (r of referencias; track r.valor) {
            <option [value]="r.valor">{{ r.etiqueta }}</option>
          }
        </select>
      </label>
      <button
        type="button"
        class="doc-print-btn doc-print-btn--primary"
        (click)="cargar()"
        [disabled]="cargando()"
      >
        {{ cargando() ? 'Cargando…' : 'Actualizar' }}
      </button>
    </div>

    @if (error()) {
      <p class="doc-print-note" role="alert">{{ error() }}</p>
    } @else if (cargando()) {
      <p class="doc-print-note">Cargando los movimientos del periodo…</p>
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
        <h2 class="doc-print-section-title">Detalle de movimientos</h2>
        @if (items().length) {
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
                <th scope="col">Referencia</th>
              </tr>
            </thead>
            <tbody>
              @for (k of items(); track k.id) {
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
                  <td class="nowrap">{{ tipoTexto(k.tipo_movimiento) }}</td>
                  <td class="num">{{ k.cantidad | number:'1.0-2' }}</td>
                  <td class="num">{{ k.saldo_resultante | number:'1.0-2' }}</td>
                  <td>
                    @if (k.referencia_tipo) {
                      {{ referenciaTexto(k.referencia_tipo) }} #{{ k.referencia_id }}
                    } @else {
                      —
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="doc-print-empty">No hay movimientos de stock en el periodo seleccionado.</p>
        }
      </section>
    }
  </app-documento-impresion>
  `,
})
export class KardexImpresionComponent implements OnInit {
  private svc = inject(InsumosService);

  readonly items = signal<Kardex[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  filtros = {
    desde: inicioDeMes(),
    hasta: hoyISO(),
    tipo_movimiento: '',
    referencia_tipo: '',
  };

  readonly tipos = [
    { valor: 'entrada', etiqueta: 'Entrada' },
    { valor: 'salida', etiqueta: 'Salida' },
    { valor: 'traslado', etiqueta: 'Traslado' },
    { valor: 'consumo', etiqueta: 'Consumo' },
    { valor: 'ajuste', etiqueta: 'Ajuste' },
  ];

  readonly referencias = [
    { valor: 'ingreso', etiqueta: 'Ingreso' },
    { valor: 'despacho', etiqueta: 'Despacho' },
    { valor: 'unidosis', etiqueta: 'Unidosis' },
    { valor: 'atencion', etiqueta: 'Atención' },
    { valor: 'ajuste', etiqueta: 'Ajuste' },
  ];

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

    const params: Record<string, unknown> = {
      desde: this.filtros.desde || undefined,
      hasta: this.filtros.hasta ? sumarDia(this.filtros.hasta) : undefined,
      tipo_movimiento: this.filtros.tipo_movimiento || undefined,
      referencia_tipo: this.filtros.referencia_tipo || undefined,
    };

    cargarTodasLasPaginas<Kardex>((p) => this.svc.listarKardex(p), params).subscribe({
      next: (items) => {
        this.items.set(items);
        this.cargando.set(false);
      },
      error: () => {
        this.items.set([]);
        this.cargando.set(false);
        this.error.set('No se pudo cargar el kardex del periodo.');
      },
    });
  }

  subtitulo(): string {
    return `Del ${fechaCorta(this.filtros.desde)} al ${fechaCorta(this.filtros.hasta)}`;
  }

  meta(): DocumentoMeta[] {
    return [
      { etiqueta: 'Movimientos', valor: String(this.items().length) },
      {
        etiqueta: 'Tipo',
        valor: this.etiquetaTipoFiltro(this.filtros.tipo_movimiento),
      },
      {
        etiqueta: 'Origen',
        valor: this.etiquetaReferenciaFiltro(this.filtros.referencia_tipo),
      },
    ];
  }

  resumen(): Kpi[] {
    const items = this.items();
    const contar = (tipos: string[]) =>
      items.filter((k) => tipos.includes(k.tipo_movimiento)).length;

    return [
      { etiqueta: 'Movimientos', valor: items.length },
      { etiqueta: 'Entradas', valor: contar(['entrada']) },
      { etiqueta: 'Salidas / consumos', valor: contar(['salida', 'consumo']) },
      { etiqueta: 'Traslados / ajustes', valor: contar(['traslado', 'ajuste']) },
    ];
  }

  private etiquetaTipoFiltro(valor: string): string {
    return this.tipos.find((t) => t.valor === valor)?.etiqueta || 'Todos';
  }

  private etiquetaReferenciaFiltro(valor: string): string {
    return this.referencias.find((r) => r.valor === valor)?.etiqueta || 'Todos';
  }

  tipoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      entrada: 'Entrada',
      salida: 'Salida',
      traslado: 'Traslado',
      consumo: 'Consumo',
      ajuste: 'Ajuste',
    };
    return etiquetas[tipo] || tipo;
  }

  referenciaTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      requisicion: 'Requisición',
      despacho: 'Despacho',
      unidosis: 'Unidosis',
      atencion: 'Atención',
      ingreso: 'Ingreso',
      ajuste: 'Ajuste',
    };
    return etiquetas[tipo] || tipo;
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
