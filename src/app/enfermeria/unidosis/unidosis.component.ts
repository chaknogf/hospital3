import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsumosService } from '../../insumos/insumos.service';
import { Unidosis, UnidosisListResponse } from '../../insumos/insumos.model';

/**
 * Administración de unidosis en el pie de cama (enfermería).
 *
 * Muestra el paciente y las dosis pautadas con sus etiquetas legibles
 * (insumo, presentación, lote) en lugar de IDs numéricos.
 */
@Component({
  selector: 'app-unidosis-enfermeria',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">
    <header class="page-head">
      <p class="eyebrow">Enfermería · Unidosis</p>
      <h2>Administración al pie de cama</h2>
      <p class="muted">Confirma la dosis preparada por farmacia antes de administrarla.</p>
    </header>

    @if (error) {
      <p class="alerta alerta--error" role="alert">{{ error }}</p>
    }
    @if (mensaje) {
      <p class="alerta alerta--ok" role="status">{{ mensaje }}</p>
    }

    @if (!items.length) {
      <p class="empty">No hay unidosis pendientes de administración.</p>
    }

    @for (u of items; track u.id) {
      <article class="uni-card">
        <div class="uni-head">
          <div>
            <p class="uni-paciente">{{ u.paciente_nombre || 'Paciente sin nombre' }}</p>
            <p class="uni-numero">{{ u.numero || 'Sin número' }}</p>
          </div>
          <span class="theme-badge" [ngClass]="claseEstado(u.estado)">{{ estadoTexto(u.estado) }}</span>
        </div>

        <p class="uni-meta">
          <span>{{ u.almacen_origen_nombre || 'Almacén sin nombre' }}</span>
          <span>{{ u.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
        </p>

        <ul class="uni-detalles" aria-label="Dosis preparadas">
          @for (d of u.detalles; track d.id) {
            <li>
              <div class="detalle-info">
                <span class="detalle-insumo">{{ d.insumo_nombre || d.presentacion_nombre || 'Insumo' }}</span>
                <span class="detalle-pres">
                  {{ d.presentacion_nombre }}
                  @if (d.cantidad_unidad) {
                    <span> · {{ d.cantidad_unidad }}</span>
                  }
                  @if (d.dosis) {
                    <span> · {{ d.dosis }}</span>
                  }
                </span>
                <span class="detalle-lote">Lote {{ d.lote_numero || '—' }} · {{ d.presentacion_codigo }}</span>
              </div>
              <span class="detalle-cantidad">{{ d.cantidad | number:'1.0-2' }}</span>
            </li>
          }
        </ul>

        @if (u.observaciones) {
          <p class="uni-obs">Observaciones: {{ u.observaciones }}</p>
        }

        @if (u.estado === 'preparada') {
          <div class="acciones">
            <button
              type="button"
              class="theme-btn theme-btn--primary"
              (click)="administrar(u)"
              [disabled]="procesandoId === u.id"
            >
              {{ procesandoId === u.id ? 'Administrando…' : '✓ Administrar' }}
            </button>
          </div>
        }
      </article>
    }
  </div>
  `,
  styles: [`
    .page {
      display: grid;
      gap: var(--theme-space-3);
      padding: var(--theme-space-4);
      max-width: 56rem;
      margin-inline: auto;
    }
    .page-head h2 { margin: 0; }
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
    .empty {
      margin: 0;
      padding: var(--theme-space-4);
      border: 1px dashed var(--theme-border);
      border-radius: var(--theme-radius-md);
      color: var(--theme-text-muted);
      text-align: center;
    }
    .alerta {
      margin: 0;
      padding: var(--theme-space-2);
      border-radius: var(--theme-radius-md);
      font-size: var(--theme-font-size-sm);
    }
    .alerta--error { color: var(--theme-danger-soft); background: var(--theme-danger-dim); }
    .alerta--ok { color: var(--theme-success); background: var(--theme-success-dim); }
    .uni-card {
      display: grid;
      gap: var(--theme-space-2);
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .uni-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .uni-paciente { margin: 0; font-weight: var(--theme-font-weight-bold); overflow-wrap: anywhere; }
    .uni-numero {
      margin: 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
      font-variant-numeric: tabular-nums;
    }
    .uni-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-1) var(--theme-space-3);
      margin: 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .uni-detalles { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .uni-detalles li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2px var(--theme-space-2);
      padding-top: 4px;
      border-top: 1px solid var(--theme-border);
    }
    .detalle-info { min-width: 0; display: grid; gap: 1px; }
    .detalle-insumo { font-size: var(--theme-font-size-sm); }
    .detalle-pres,
    .detalle-lote { font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .detalle-cantidad { font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .uni-obs { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .acciones { display: flex; justify-content: flex-end; }
    .acciones .theme-btn { min-height: var(--theme-touch-min); }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class UnidosisEnfermeriaComponent implements OnInit {
  private svc = inject(InsumosService);

  items: Unidosis[] = [];
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.svc.listarUnidosis({ estado: 'preparada', limit: 100 }).subscribe({
      next: (r: UnidosisListResponse) => (this.items = r.items),
      error: () => (this.error = 'No se pudieron cargar las unidosis.'),
    });
  }

  administrar(u: Unidosis): void {
    this.procesandoId = u.id;
    this.mensaje = '';
    this.error = '';
    this.svc.administrarUnidosis(u.id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensaje = `Unidosis ${u.numero || '#' + u.id} administrada.`;
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo administrar la unidosis.';
      },
    });
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      preparada: 'Pendiente',
      administrada: 'Administrada',
      cancelada: 'Cancelada',
    };
    return etiquetas[estado] || estado;
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      preparada: 'theme-badge--warning',
      administrada: 'theme-badge--success',
      cancelada: 'theme-badge--danger',
    };
    return clases[estado] || 'theme-badge--primary';
  }
}
