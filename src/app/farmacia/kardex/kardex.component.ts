import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InsumosService } from '../../insumos/insumos.service';
import { Kardex, KardexListResponse } from '../../insumos/insumos.model';

/**
 * Kardex (libro mayor de stock).
 *
 * Muestra insumo, lote y almacén resueltos por el backend en lugar de IDs
 * numéricos; la referencia se conserva como documento origen del movimiento.
 */
@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="page">
    <header class="page-head">
      <div>
        <p class="eyebrow">Farmacia · Kardex</p>
        <h2>Movimientos de stock</h2>
        <p class="muted">Entradas, salidas, traslados, consumos y ajustes por lote.</p>
      </div>
      <a class="theme-btn theme-btn--primary" routerLink="/farmacia/kardex/imprimir">
        Imprimir kardex
      </a>
    </header>

    @if (error) {
      <p class="alerta alerta--error" role="alert">{{ error }}</p>
    }

    <div class="tabla-wrap">
      <table class="theme-table w-full text-sm">
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
          @for (k of items; track k.id) {
            <tr>
              <td class="fecha">{{ k.fecha | date:'dd/MM/yy HH:mm' }}</td>
              <td>
                <span class="insumo">{{ k.insumo_nombre || 'Insumo sin nombre' }}</span>
                @if (k.presentacion_nombre) {
                  <span class="pres">{{ k.presentacion_nombre }}</span>
                }
              </td>
              <td class="mono">{{ k.lote_numero || '—' }}</td>
              <td>{{ k.almacen_nombre || 'Almacén sin nombre' }}</td>
              <td>
                <span class="theme-badge" [ngClass]="claseTipo(k.tipo_movimiento)">
                  {{ tipoTexto(k.tipo_movimiento) }}
                </span>
              </td>
              <td class="num">{{ k.cantidad | number:'1.0-2' }}</td>
              <td class="num">{{ k.saldo_resultante | number:'1.0-2' }}</td>
              <td class="ref">
                @if (k.referencia_tipo) {
                  {{ referenciaTexto(k.referencia_tipo) }} #{{ k.referencia_id }}
                } @else {
                  —
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="8" class="empty">No hay movimientos de stock registrados.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="total">Total: {{ total }} movimientos</p>
  </div>
  `,
  styles: [`
    .page {
      display: grid;
      gap: var(--theme-space-3);
      padding: var(--theme-space-4);
      max-width: 72rem;
      margin-inline: auto;
    }
    .page-head h2 { margin: 0; }
    .page-head {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-2);
      align-items: start;
      justify-content: space-between;
    }
    .eyebrow {
      margin: 0 0 2px;
      font-size: var(--theme-font-size-xs);
      font-weight: var(--theme-font-weight-bold);
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--theme-primary-light);
    }
    .muted {
      margin: var(--theme-space-1) 0 0;
      color: var(--theme-text-muted);
      font-size: var(--theme-font-size-sm);
    }
    .alerta {
      margin: 0;
      padding: var(--theme-space-2);
      border-radius: var(--theme-radius-md);
      font-size: var(--theme-font-size-sm);
      color: var(--theme-danger-soft);
      background: var(--theme-danger-dim);
    }
    .tabla-wrap {
      overflow-x: auto;
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .theme-table { border-collapse: collapse; }
    .theme-table th,
    .theme-table td {
      padding: var(--theme-space-1) var(--theme-space-2);
      text-align: left;
      vertical-align: top;
    }
    .theme-table th {
      font-size: var(--theme-font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--theme-text-muted);
      border-bottom: 1px solid var(--theme-border);
      white-space: nowrap;
    }
    .theme-table tbody tr { border-bottom: 1px solid var(--theme-border); }
    .theme-table tbody tr:last-child { border-bottom: 0; }
    .insumo { display: block; font-size: var(--theme-font-size-sm); }
    .pres { display: block; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .fecha,
    .mono {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .ref { white-space: nowrap; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .empty { text-align: center; color: var(--theme-text-muted); padding: var(--theme-space-4); }
    .total { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text-muted); }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class KardexComponent implements OnInit {
  private svc = inject(InsumosService);

  items: Kardex[] = [];
  total = 0;
  error = '';

  ngOnInit(): void {
    this.svc.listarKardex({ limit: 200 }).subscribe({
      next: (r: KardexListResponse) => {
        this.items = r.items;
        this.total = r.total;
      },
      error: () => (this.error = 'No se pudo cargar el kardex.'),
    });
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

  claseTipo(tipo: string): string {
    const clases: Record<string, string> = {
      entrada: 'theme-badge--success',
      salida: 'theme-badge--danger',
      traslado: 'theme-badge--info',
      consumo: 'theme-badge--warning',
      ajuste: 'theme-badge--primary',
    };
    return clases[tipo] || 'theme-badge--primary';
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
