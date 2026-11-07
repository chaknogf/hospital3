import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InsumosService } from '../../insumos/insumos.service';
import { PresentacionPickerComponent } from '../../insumos/presentacion-picker/presentacion-picker.component';
import {
  Presentacion,
  Requisicion,
  RequisicionCreate,
  RequisicionListResponse,
} from '../../insumos/insumos.model';

interface ServicioOption {
  id: number;
  nombre_servicio?: string;
  nombre?: string;
  codigo?: string;
}

interface LineaRequisicion {
  presentacion: Presentacion;
  cantidad: number;
}

/**
 * Solicitud de insumos de enfermería a farmacia.
 *
 * El usuario elige el servicio y busca por nombre de insumo; nunca escribe
 * IDs. Las líneas se pueden editar o quitar antes de enviar.
 */
@Component({
  selector: 'app-solicitar-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule, PresentacionPickerComponent],
  template: `
  <div class="page">
    <header class="page-head">
      <p class="eyebrow">Enfermería · Insumos</p>
      <h2>Nueva requisición</h2>
      <p class="muted">Solicita insumos a farmacia y consulta el estado de tus solicitudes.</p>
    </header>

    <section class="theme-card form-card" aria-label="Datos de la requisición">
      <label class="field">
        <span class="theme-label">Servicio solicitante</span>
        <select
          class="theme-input"
          [(ngModel)]="servicioId"
          name="servicio"
          [attr.aria-invalid]="intentado && !servicioId"
        >
          <option [ngValue]="null">Selecciona el servicio</option>
          @for (s of servicios; track s.id) {
            <option [ngValue]="s.id">{{ nombreServicio(s) }}</option>
          }
        </select>
        @if (intentado && !servicioId) {
          <span class="error">Selecciona el servicio que solicita.</span>
        }
      </label>

      <div class="field">
        <span class="theme-label">Insumo</span>
        <app-presentacion-picker [(presentacion)]="linea.presentacion" />
      </div>

      <div class="cantidad-row">
        <label class="field">
          <span class="theme-label">Cantidad</span>
          <input
            class="theme-input"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            [(ngModel)]="linea.cantidad"
            name="cantidad"
          />
        </label>
        <button
          type="button"
          class="theme-btn theme-btn--primary"
          (click)="agregarLinea()"
          [disabled]="!linea.presentacion || linea.cantidad <= 0"
        >
          Agregar
        </button>
      </div>

      @if (lineas.length) {
        <ul class="lineas" aria-label="Insumos solicitados">
          @for (l of lineas; track l.presentacion.id; let i = $index) {
            <li class="linea">
              <div class="linea-info">
                <p class="linea-title">{{ l.presentacion.insumo_nombre || l.presentacion.nombre }}</p>
                <p class="linea-sub">
                  {{ l.presentacion.nombre }}
                  @if (l.presentacion.cantidad_unidad) {
                    <span> · {{ l.presentacion.cantidad_unidad }}</span>
                  }
                </p>
                <p class="linea-code">Código {{ l.presentacion.codigo_presentacion }}</p>
              </div>
              <div class="linea-actions">
                <label class="cantidad-mini">
                  <span class="theme-label">Cant.</span>
                  <input
                    class="theme-input"
                    type="number"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    [(ngModel)]="l.cantidad"
                    [name]="'cantidad-' + i"
                  />
                </label>
                <button
                  type="button"
                  class="theme-btn theme-btn--ghost"
                  (click)="quitarLinea(i)"
                  [attr.aria-label]="'Quitar ' + (l.presentacion.insumo_nombre || l.presentacion.nombre)"
                >
                  Quitar
                </button>
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="empty">Aún no has agregado insumos. Busca uno y pulsa “Agregar”.</p>
      }

      <label class="field">
        <span class="theme-label">Observaciones (opcional)</span>
        <textarea
          class="theme-input"
          rows="2"
          maxlength="500"
          [(ngModel)]="observaciones"
          name="observaciones"
          placeholder="Ej. urgente para turno nocturno"
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
        class="theme-btn theme-btn--primary enviar"
        (click)="enviar()"
        [disabled]="enviando || !puedeEnviar()"
      >
        {{ enviando ? 'Enviando…' : 'Enviar requisición' }}
      </button>
    </section>

    <section class="historial" aria-label="Mis requisiciones">
      <div class="historial-head">
        <h3>Mis requisiciones</h3>
        <button type="button" class="theme-btn theme-btn--ghost" (click)="cargar()">Actualizar</button>
      </div>

      @if (!items.length) {
        <p class="empty">Todavía no hay requisiciones registradas.</p>
      }

      @for (r of items; track r.id) {
        <article class="req-card">
          <div class="req-head">
            <div>
              <p class="req-numero">{{ r.numero }}</p>
              <p class="req-servicio">
                {{ r.servicio_solicitante_nombre || 'Servicio sin nombre' }}
              </p>
            </div>
            <span class="theme-badge" [ngClass]="claseEstado(r.estado)">{{ estadoTexto(r.estado) }}</span>
          </div>
          <p class="req-fecha">{{ r.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
          <ul class="req-detalles">
            @for (d of r.detalles; track d.id) {
              <li>
                <span class="req-item">{{ d.insumo_nombre || d.presentacion_nombre || 'Presentación' }}</span>
                <span class="req-cantidad">{{ d.cantidad_solicitada | number:'1.0-2' }}</span>
                <span class="req-pres">{{ d.presentacion_codigo }} · {{ d.presentacion_nombre }}</span>
              </li>
            }
          </ul>
          @if (r.observaciones) {
            <p class="req-obs">Observaciones: {{ r.observaciones }}</p>
          }
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
    .cantidad-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--theme-space-2);
      align-items: end;
    }
    .lineas {
      list-style: none;
      display: grid;
      gap: var(--theme-space-2);
      margin: 0;
      padding: 0;
    }
    .linea {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-2);
      align-items: center;
      justify-content: space-between;
      padding: var(--theme-space-2);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface-raised);
    }
    .linea-info { min-width: 0; flex: 1 1 14rem; }
    .linea-title { margin: 0; font-weight: var(--theme-font-weight-bold); overflow-wrap: anywhere; }
    .linea-sub { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .linea-code { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .linea-actions { display: flex; gap: var(--theme-space-2); align-items: end; }
    .cantidad-mini { display: grid; gap: 2px; width: 6rem; }
    .empty {
      margin: 0;
      padding: var(--theme-space-3);
      border: 1px dashed var(--theme-border);
      border-radius: var(--theme-radius-md);
      color: var(--theme-text-muted);
      font-size: var(--theme-font-size-sm);
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
    .error { color: var(--theme-danger-soft); font-size: var(--theme-font-size-xs); }
    .enviar { width: 100%; }
    .historial { display: grid; gap: var(--theme-space-2); }
    .historial-head { display: flex; align-items: center; justify-content: space-between; gap: var(--theme-space-2); }
    .historial-head h3 { margin: 0; }
    .req-card {
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .req-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .req-numero { margin: 0; font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .req-servicio { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .req-fecha { margin: var(--theme-space-1) 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .req-detalles { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .req-detalles li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2px var(--theme-space-2);
      padding-top: 4px;
      border-top: 1px solid var(--theme-border);
    }
    .req-item { font-size: var(--theme-font-size-sm); }
    .req-cantidad { font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .req-pres { grid-column: 1 / -1; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .req-obs { margin: var(--theme-space-2) 0 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    @media (min-width: 48rem) {
      .form-card { grid-template-columns: 1fr 1fr; }
      .form-card > .field:first-child,
      .form-card > .lineas,
      .form-card > .empty,
      .form-card > .alerta,
      .enviar { grid-column: 1 / -1; }
      .cantidad-row { grid-column: 1 / -1; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class SolicitarInsumosComponent implements OnInit {
  private svc = inject(InsumosService);

  items: Requisicion[] = [];
  servicios: ServicioOption[] = [];
  lineas: LineaRequisicion[] = [];

  servicioId: number | null = null;
  observaciones = '';
  linea: { presentacion: Presentacion | null; cantidad: number } = {
    presentacion: null,
    cantidad: 1,
  };

  enviando = false;
  intentado = false;
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargar();
    this.svc.listarServicios().subscribe({
      next: (r) => {
        const lista = Array.isArray(r) ? r : (r?.items || []);
        this.servicios = lista.filter((s: ServicioOption) => (s as any).activo !== false);
      },
      error: () => {
        this.servicios = [];
        this.error = 'No se pudieron cargar los servicios. Intenta de nuevo.';
      },
    });
  }

  cargar(): void {
    this.svc.listarRequisiciones({ limit: 100 }).subscribe({
      next: (r: RequisicionListResponse) => (this.items = r.items),
      error: () => (this.error = 'No se pudieron cargar las requisiciones.'),
    });
  }

  nombreServicio(s: ServicioOption): string {
    return s.nombre_servicio || s.nombre || s.codigo || `Servicio #${s.id}`;
  }

  agregarLinea(): void {
    const presentacion = this.linea.presentacion;
    const cantidad = Number(this.linea.cantidad);
    if (!presentacion || !Number.isFinite(cantidad) || cantidad <= 0) return;

    const existente = this.lineas.find((l) => l.presentacion.id === presentacion.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.lineas = [...this.lineas, { presentacion, cantidad }];
    }
    this.linea = { presentacion: null, cantidad: 1 };
    this.mensaje = '';
    this.error = '';
  }

  quitarLinea(index: number): void {
    this.lineas = this.lineas.filter((_, i) => i !== index);
  }

  puedeEnviar(): boolean {
    return (
      this.servicioId != null &&
      this.lineas.length > 0 &&
      this.lineas.every((l) => Number(l.cantidad) > 0)
    );
  }

  enviar(): void {
    this.intentado = true;
    this.mensaje = '';
    this.error = '';

    if (!this.puedeEnviar()) {
      this.error = 'Selecciona el servicio y agrega al menos un insumo con cantidad válida.';
      return;
    }

    const body: RequisicionCreate = {
      servicio_solicitante_id: this.servicioId as number,
      observaciones: this.observaciones.trim(),
      detalles: this.lineas.map((l) => ({
        presentacion_id: l.presentacion.id,
        cantidad_solicitada: Number(l.cantidad),
      })),
    };

    this.enviando = true;
    this.svc.crearRequisicion(body).subscribe({
      next: (req) => {
        this.enviando = false;
        this.mensaje = `Requisición ${req.numero} enviada a farmacia.`;
        this.intentado = false;
        this.servicioId = null;
        this.observaciones = '';
        this.lineas = [];
        this.linea = { presentacion: null, cantidad: 1 };
        this.cargar();
      },
      error: (err) => {
        this.enviando = false;
        this.error = err?.error?.detail || 'No se pudo enviar la requisición. Revisa los datos.';
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
