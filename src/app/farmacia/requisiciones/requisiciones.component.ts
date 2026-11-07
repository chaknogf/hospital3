import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { Requisicion, RequisicionListResponse } from '../../insumos/insumos.model';

/**
 * Bandeja de requisiciones para farmacia.
 *
 * Muestra el servicio y las líneas con nombres legibles (el backend resuelve
 * las etiquetas), y permite aprobar o rechazar con una observación.
 */
@Component({
  selector: 'app-requisiciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <header class="page-head">
      <p class="eyebrow">Farmacia · Requisiciones</p>
      <h2>Bandeja de solicitudes</h2>
      <p class="muted">Revisa lo que piden los servicios y aprueba o rechaza con trazabilidad.</p>
    </header>

    <div class="filtros" role="group" aria-label="Filtrar por estado">
      @for (f of filtros; track f.valor) {
        <button
          type="button"
          class="chip"
          [class.chip--activo]="estado === f.valor"
          [attr.aria-pressed]="estado === f.valor"
          (click)="filtrar(f.valor)"
        >
          {{ f.etiqueta }}
        </button>
      }
    </div>

    @if (error) {
      <p class="alerta alerta--error" role="alert">{{ error }}</p>
    }
    @if (mensaje) {
      <p class="alerta alerta--ok" role="status">{{ mensaje }}</p>
    }

    @if (!items.length) {
      <p class="empty">
        No hay requisiciones {{ estado ? 'en estado ' + estadoTexto(estado) : '' }}.
      </p>
    }

    @for (r of items; track r.id) {
      <article class="req-card">
        <div class="req-head">
          <div>
            <p class="req-numero">{{ r.numero }}</p>
            <p class="req-servicio">{{ r.servicio_solicitante_nombre || 'Servicio sin nombre' }}</p>
          </div>
          <span class="theme-badge" [ngClass]="claseEstado(r.estado)">{{ estadoTexto(r.estado) }}</span>
        </div>

        <div class="req-meta">
          <span>Solicitada {{ r.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
          @if (r.fecha_aprobacion) {
            <span>Aprobada {{ r.fecha_aprobacion | date:'dd/MM/yyyy HH:mm' }}</span>
          }
        </div>

        <ul class="req-detalles">
          @for (d of r.detalles; track d.id) {
            <li>
              <div class="detalle-info">
                <span class="detalle-insumo">{{ d.insumo_nombre || d.presentacion_nombre || 'Presentación' }}</span>
                <span class="detalle-pres">
                  {{ d.presentacion_codigo }} · {{ d.presentacion_nombre }}
                  @if (d.cantidad_unidad) {
                    <span> · {{ d.cantidad_unidad }}</span>
                  }
                </span>
              </div>
              <span class="detalle-cantidad">{{ d.cantidad_solicitada | number:'1.0-2' }}</span>
            </li>
          }
        </ul>

        @if (r.observaciones) {
          <p class="req-obs">Observaciones: {{ r.observaciones }}</p>
        }

        @if (esJefe && r.estado === 'pendiente') {
          @if (rechazandoId === r.id) {
            <div class="rechazo">
              <label class="field">
                <span class="theme-label">Motivo del rechazo</span>
                <textarea
                  class="theme-input"
                  rows="2"
                  maxlength="300"
                  [(ngModel)]="observacion"
                  [name]="'obs-' + r.id"
                  placeholder="Ej. no hay existencia en farmacia"
                ></textarea>
              </label>
              <div class="acciones">
                <button
                  type="button"
                  class="theme-btn theme-btn--primary"
                  (click)="confirmarRechazo(r)"
                  [disabled]="procesandoId === r.id"
                >
                  {{ procesandoId === r.id ? 'Rechazando…' : 'Confirmar rechazo' }}
                </button>
                <button type="button" class="theme-btn" (click)="cancelarRechazo()">Cancelar</button>
              </div>
            </div>
          } @else {
            <div class="acciones">
              <button
                type="button"
                class="theme-btn theme-btn--primary"
                (click)="aprobar(r)"
                [disabled]="procesandoId === r.id"
              >
                {{ procesandoId === r.id ? 'Aprobando…' : 'Aprobar' }}
              </button>
              <button
                type="button"
                class="theme-btn theme-btn--ghost peligro"
                (click)="iniciarRechazo(r)"
                [disabled]="procesandoId === r.id"
              >
                Rechazar
              </button>
            </div>
          }
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
    .filtros { display: flex; flex-wrap: wrap; gap: var(--theme-space-2); }
    .chip {
      min-height: var(--theme-touch-min);
      padding: var(--theme-space-1) var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-pill);
      background: var(--theme-surface);
      color: var(--theme-text);
      font-family: var(--theme-font-ui);
      font-size: var(--theme-font-size-sm);
      cursor: pointer;
    }
    .chip--activo {
      border-color: var(--theme-primary);
      background: var(--theme-primary-dim);
      color: var(--theme-primary-light);
      font-weight: var(--theme-font-weight-bold);
    }
    .chip:focus-visible { outline: 2px solid var(--theme-primary); outline-offset: 2px; }
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
    .req-card {
      display: grid;
      gap: var(--theme-space-2);
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .req-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .req-numero { margin: 0; font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .req-servicio { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .req-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-1) var(--theme-space-3);
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .req-detalles { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .req-detalles li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2px var(--theme-space-2);
      padding-top: 4px;
      border-top: 1px solid var(--theme-border);
    }
    .detalle-info { min-width: 0; }
    .detalle-insumo { display: block; font-size: var(--theme-font-size-sm); }
    .detalle-pres { display: block; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .detalle-cantidad { font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .req-obs { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .acciones { display: flex; flex-wrap: wrap; gap: var(--theme-space-2); }
    .peligro { color: var(--theme-danger-soft); }
    .rechazo { display: grid; gap: var(--theme-space-2); }
    .field { display: grid; gap: var(--theme-space-1); }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class RequisicionesComponent implements OnInit {
  private svc = inject(InsumosService);
  private auth = inject(AuthService);

  items: Requisicion[] = [];
  estado: string | undefined = 'pendiente';
  procesandoId: number | null = null;
  rechazandoId: number | null = null;
  observacion = '';
  mensaje = '';
  error = '';

  readonly filtros = [
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'aprobada', etiqueta: 'Aprobadas' },
    { valor: 'despachada', etiqueta: 'Despachadas' },
    { valor: 'rechazada', etiqueta: 'Rechazadas' },
    { valor: undefined, etiqueta: 'Todas' },
  ] as const;

  get esJefe(): boolean {
    const r = this.auth.getUsuarioActual().role;
    return r === 'admin' || r === 'jefe_farmacia';
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.svc.listarRequisiciones({ estado: this.estado, limit: 100 }).subscribe({
      next: (r: RequisicionListResponse) => (this.items = r.items),
      error: () => (this.error = 'No se pudieron cargar las requisiciones.'),
    });
  }

  filtrar(estado: string | undefined): void {
    this.estado = estado;
    this.mensaje = '';
    this.error = '';
    this.rechazandoId = null;
    this.cargar();
  }

  aprobar(r: Requisicion): void {
    this.procesandoId = r.id;
    this.mensaje = '';
    this.error = '';
    this.svc.aprobarRequisicion(r.id, 'Aprobada desde bandeja de farmacia').subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensaje = `Requisición ${r.numero} aprobada.`;
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo aprobar la requisición.';
      },
    });
  }

  iniciarRechazo(r: Requisicion): void {
    this.rechazandoId = r.id;
    this.observacion = '';
    this.error = '';
  }

  cancelarRechazo(): void {
    this.rechazandoId = null;
    this.observacion = '';
  }

  confirmarRechazo(r: Requisicion): void {
    const motivo = this.observacion.trim();
    if (!motivo) {
      this.error = 'Escribe el motivo del rechazo para dejar constancia.';
      return;
    }
    this.procesandoId = r.id;
    this.error = '';
    this.svc.rechazarRequisicion(r.id, motivo).subscribe({
      next: () => {
        this.procesandoId = null;
        this.rechazandoId = null;
        this.observacion = '';
        this.mensaje = `Requisición ${r.numero} rechazada.`;
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo rechazar la requisición.';
      },
    });
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      despachada: 'Despachada',
      anulada: 'Anulada',
    };
    return etiquetas[estado] || estado;
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      pendiente: 'theme-badge--warning',
      aprobada: 'theme-badge--info',
      rechazada: 'theme-badge--danger',
      despachada: 'theme-badge--success',
      anulada: 'theme-badge--danger',
    };
    return clases[estado] || 'theme-badge--primary';
  }
}
