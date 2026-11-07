import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InsumosService } from '../../insumos/insumos.service';
import { PacientePickerComponent } from '../../shared/components/paciente-picker/paciente-picker.component';
import { Atencion, AtencionDetalle, AtencionListResponse } from '../../insumos/insumos.model';
import { PacienteResumen } from '../../interface/interfaces';

interface ServicioOption {
  id: number;
  nombre_servicio?: string;
  nombre?: string;
  codigo?: string;
  activo?: boolean;
}

/**
 * Apertura y seguimiento de atenciones con consumo de insumos.
 *
 * El paciente se elige con búsqueda por nombre/CUI/expediente y el servicio
 * por nombre; no se piden IDs numéricos.
 */
@Component({
  selector: 'app-atenciones-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule, PacientePickerComponent],
  template: `
  <div class="page">
    <header class="page-head">
      <p class="eyebrow">Enfermería · Insumos</p>
      <h2>Atenciones con consumo de insumos</h2>
      <p class="muted">Abre una atención para descontar insumos del stock y ciérrala al terminar.</p>
    </header>

    <section class="theme-card form-card" aria-label="Abrir atención">
      <div class="field">
        <span class="theme-label">Paciente</span>
        <app-paciente-picker [(paciente)]="paciente" />
        @if (intentado && !paciente) {
          <span class="error">Selecciona el paciente de la atención.</span>
        }
      </div>

      <label class="field">
        <span class="theme-label">Servicio (opcional)</span>
        <select class="theme-input" [(ngModel)]="servicioId" name="servicio">
          <option [ngValue]="null">Sin servicio asignado</option>
          @for (s of servicios; track s.id) {
            <option [ngValue]="s.id">{{ nombreServicio(s) }}</option>
          }
        </select>
      </label>

      <label class="field">
        <span class="theme-label">Observaciones (opcional)</span>
        <textarea
          class="theme-input"
          rows="2"
          maxlength="500"
          [(ngModel)]="observaciones"
          name="observaciones"
          placeholder="Ej. atención en sala de recuperación"
        ></textarea>
      </label>

      @if (error) {
        <p class="alerta alerta--error" role="alert">{{ error }}</p>
      }
      @if (mensaje) {
        <p class="alerta alerta--ok" role="status">{{ mensaje }}</p>
      }

      <button
        type="button"
        class="theme-btn theme-btn--primary"
        (click)="crear()"
        [disabled]="creando"
      >
        {{ creando ? 'Abriendo…' : 'Abrir atención' }}
      </button>
    </section>

    <section class="historial" aria-label="Atenciones registradas">
      <div class="historial-head">
        <h3>Atenciones</h3>
        <button type="button" class="theme-btn theme-btn--ghost" (click)="cargar()">Actualizar</button>
      </div>

      @if (!items.length) {
        <p class="empty">No hay atenciones registradas.</p>
      }

      @for (a of items; track a.id) {
        <article class="atencion-card">
          <div class="atencion-head">
            <div>
              <p class="atencion-paciente">{{ a.paciente_nombre || 'Paciente sin nombre' }}</p>
              <p class="atencion-servicio">
                {{ a.servicio_nombre || 'Sin servicio' }}
                @if (a.observaciones) {
                  <span> · {{ a.observaciones }}</span>
                }
              </p>
            </div>
            <span class="theme-badge" [ngClass]="claseEstado(a.estado)">{{ estadoTexto(a.estado) }}</span>
          </div>

          <p class="atencion-meta">
            <span>#{{ a.id }}</span>
            <span>{{ a.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
          </p>

          @if (detalleId === a.id && detalle) {
            @if (detalle.insumos_consumidos.length) {
              <ul class="consumos" aria-label="Insumos consumidos">
                @for (c of detalle.insumos_consumidos; track c.id) {
                  <li>
                    <span class="consumo-insumo">{{ c.insumo_nombre || c.presentacion_nombre || 'Insumo' }}</span>
                    <span class="consumo-cantidad">{{ c.cantidad | number:'1.0-2' }}</span>
                    <span class="consumo-pres">
                      Lote {{ c.lote_numero || '—' }} · {{ c.presentacion_codigo }} · {{ c.presentacion_nombre }}
                    </span>
                  </li>
                }
              </ul>
            } @else {
              <p class="hint">Esta atención todavía no registra consumos.</p>
            }
          }

          <div class="acciones">
            <button type="button" class="theme-btn theme-btn--ghost" (click)="verDetalle(a)">
              {{ detalleId === a.id ? 'Ocultar consumos' : 'Ver consumos' }}
            </button>
            @if (a.estado === 'abierta') {
              <button
                type="button"
                class="theme-btn theme-btn--primary"
                (click)="finalizar(a)"
                [disabled]="procesandoId === a.id"
              >
                {{ procesandoId === a.id ? 'Finalizando…' : 'Finalizar' }}
              </button>
            }
          </div>
        </article>
      }
    </section>
  </div>
  `,
  styles: [`
    .page {
      display: grid;
      gap: var(--theme-space-4);
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
    .form-card { display: grid; gap: var(--theme-space-3); }
    .field { display: grid; gap: var(--theme-space-1); }
    .alerta {
      margin: 0;
      padding: var(--theme-space-2);
      border-radius: var(--theme-radius-md);
      font-size: var(--theme-font-size-sm);
    }
    .alerta--error { color: var(--theme-danger-soft); background: var(--theme-danger-dim); }
    .alerta--ok { color: var(--theme-success); background: var(--theme-success-dim); }
    .error { color: var(--theme-danger-soft); font-size: var(--theme-font-size-xs); }
    .historial { display: grid; gap: var(--theme-space-2); }
    .historial-head { display: flex; align-items: center; justify-content: space-between; gap: var(--theme-space-2); }
    .historial-head h3 { margin: 0; }
    .empty {
      margin: 0;
      padding: var(--theme-space-4);
      border: 1px dashed var(--theme-border);
      border-radius: var(--theme-radius-md);
      color: var(--theme-text-muted);
      text-align: center;
    }
    .atencion-card {
      display: grid;
      gap: var(--theme-space-2);
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .atencion-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .atencion-paciente { margin: 0; font-weight: var(--theme-font-weight-bold); overflow-wrap: anywhere; }
    .atencion-servicio { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .atencion-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-1) var(--theme-space-3);
      margin: 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
      font-variant-numeric: tabular-nums;
    }
    .consumos { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .consumos li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2px var(--theme-space-2);
      padding-top: 4px;
      border-top: 1px solid var(--theme-border);
    }
    .consumo-insumo { font-size: var(--theme-font-size-sm); }
    .consumo-cantidad { font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .consumo-pres { grid-column: 1 / -1; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .hint { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .acciones { display: flex; flex-wrap: wrap; gap: var(--theme-space-2); justify-content: flex-end; }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class AtencionesInsumosComponent implements OnInit {
  private svc = inject(InsumosService);

  items: Atencion[] = [];
  servicios: ServicioOption[] = [];
  paciente: PacienteResumen | null = null;
  servicioId: number | null = null;
  observaciones = '';

  detalle: AtencionDetalle | null = null;
  detalleId: number | null = null;

  creando = false;
  intentado = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
    this.svc.listarServicios().subscribe({
      next: (r) => {
        const lista = Array.isArray(r) ? r : (r?.items || []);
        this.servicios = lista.filter((s: ServicioOption) => s.activo !== false);
      },
      error: () => (this.servicios = []),
    });
  }

  cargar(): void {
    this.svc.listarAtenciones({ limit: 100 }).subscribe({
      next: (r: AtencionListResponse) => (this.items = r.items),
      error: () => (this.error = 'No se pudieron cargar las atenciones.'),
    });
  }

  nombreServicio(s: ServicioOption): string {
    return s.nombre_servicio || s.nombre || s.codigo || `Servicio #${s.id}`;
  }

  crear(): void {
    this.intentado = true;
    this.mensaje = '';
    this.error = '';

    if (!this.paciente) {
      this.error = 'Selecciona el paciente antes de abrir la atención.';
      return;
    }

    this.creando = true;
    this.svc
      .crearAtencion({
        paciente_id: this.paciente.id,
        servicio_id: this.servicioId ?? undefined,
        observaciones: this.observaciones.trim(),
      })
      .subscribe({
        next: (a) => {
          this.creando = false;
          this.mensaje = `Atención #${a.id} abierta para ${a.paciente_nombre || 'el paciente'}.`;
          this.intentado = false;
          this.paciente = null;
          this.servicioId = null;
          this.observaciones = '';
          this.cargar();
        },
        error: (err) => {
          this.creando = false;
          this.error = err?.error?.detail || 'No se pudo abrir la atención.';
        },
      });
  }

  verDetalle(a: Atencion): void {
    if (this.detalleId === a.id) {
      this.detalleId = null;
      this.detalle = null;
      return;
    }
    this.detalleId = a.id;
    this.detalle = null;
    this.svc.obtenerAtencion(a.id).subscribe({
      next: (d) => {
        if (this.detalleId === a.id) this.detalle = d;
      },
      error: () => {
        this.detalleId = null;
        this.error = 'No se pudieron cargar los consumos de la atención.';
      },
    });
  }

  finalizar(a: Atencion): void {
    this.procesandoId = a.id;
    this.mensaje = '';
    this.error = '';
    this.svc.finalizarAtencion(a.id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensaje = `Atención #${a.id} finalizada.`;
        if (this.detalleId === a.id) {
          this.detalleId = null;
          this.detalle = null;
        }
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo finalizar la atención.';
      },
    });
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      abierta: 'Abierta',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
    };
    return etiquetas[estado] || estado;
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      abierta: 'theme-badge--info',
      finalizada: 'theme-badge--success',
      cancelada: 'theme-badge--danger',
    };
    return clases[estado] || 'theme-badge--primary';
  }
}
