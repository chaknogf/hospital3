import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InsumosService } from '../../insumos/insumos.service';
import { PresentacionPickerComponent } from '../../insumos/presentacion-picker/presentacion-picker.component';
import {
  Almacen,
  AlmacenListResponse,
  Lote,
  LoteIngresoCreate,
  LoteListResponse,
  Presentacion,
} from '../../insumos/insumos.model';

/**
 * Almacenes, stock por lote e ingreso de existencias.
 *
 * El ingreso elige la presentación por búsqueda (no por ID) y el almacén por
 * nombre; la tabla de lotes muestra insumo, presentación y almacén resueltos.
 */
@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, FormsModule, PresentacionPickerComponent],
  template: `
  <div class="page">
    <header class="page-head">
      <p class="eyebrow">Farmacia · Almacén</p>
      <h2>Almacenes y lotes</h2>
      <p class="muted">Consulta el stock real y registra ingresos con lote y vencimiento.</p>
    </header>

    <section class="theme-card" aria-label="Almacenes">
      <h3 class="section-title">Almacenes</h3>
      <ul class="almacenes">
        @for (a of almacenes; track a.id) {
          <li class="almacen">
            <span class="almacen-codigo">{{ a.codigo }}</span>
            <span class="almacen-nombre">{{ a.nombre }}</span>
            <span class="theme-badge theme-badge--primary">{{ tipoTexto(a.tipo) }}</span>
          </li>
        } @empty {
          <li class="empty">No hay almacenes registrados.</li>
        }
      </ul>
    </section>

    <section class="theme-card" aria-label="Stock por lote">
      <div class="section-head">
        <h3 class="section-title">Stock por lote</h3>
        <button type="button" class="theme-btn theme-btn--ghost" (click)="cargarLotes()">Actualizar</button>
      </div>

      @if (error) {
        <p class="alerta alerta--error" role="alert">{{ error }}</p>
      }
      @if (mensaje) {
        <p class="alerta alerta--ok" role="status">{{ mensaje }}</p>
      }

      @if (!lotes.length) {
        <p class="empty">No hay lotes registrados.</p>
      }

      @for (l of lotes; track l.id) {
        <article class="lote-card">
          <div class="lote-head">
            <div>
              <p class="lote-insumo">{{ l.insumo_nombre || 'Insumo sin nombre' }}</p>
              <p class="lote-pres">
                {{ l.presentacion_nombre || 'Presentación' }}
                @if (l.cantidad_unidad) {
                  <span> · {{ l.cantidad_unidad }}</span>
                }
              </p>
            </div>
            <span class="lote-cantidad" [class.lote-cantidad--cero]="l.cantidad_actual <= 0">
              {{ l.cantidad_actual | number:'1.0-2' }}
            </span>
          </div>
          <p class="lote-meta">
            <span>Lote {{ l.numero_lote || '—' }}</span>
            <span>{{ l.almacen_nombre || 'Almacén sin nombre' }}</span>
            <span>Código {{ l.presentacion_codigo || '—' }}</span>
          </p>
          <p class="lote-meta">
            @if (l.fecha_vencimiento) {
              <span>Vence {{ l.fecha_vencimiento }}</span>
            } @else {
              <span>Sin fecha de vencimiento</span>
            }
            @if (l.cantidad_actual <= 0) {
              <span class="theme-badge theme-badge--danger">Sin stock</span>
            } @else if (proximoAVencer(l)) {
              <span class="theme-badge theme-badge--warning">Por vencer</span>
            }
          </p>
        </article>
      }
    </section>

    <section class="theme-card form-card" aria-label="Ingreso de lote">
      <h3 class="section-title">Ingreso de lote</h3>

      <div class="field">
        <span class="theme-label">Presentación</span>
        <app-presentacion-picker [(presentacion)]="presentacion" />
        @if (intentado && !presentacion) {
          <span class="error">Busca y selecciona la presentación que ingresa.</span>
        }
      </div>

      <label class="field">
        <span class="theme-label">Almacén</span>
        <select class="theme-input" [(ngModel)]="ingreso.almacen_id" name="almacen">
          <option [ngValue]="null">Selecciona el almacén</option>
          @for (a of almacenes; track a.id) {
            <option [ngValue]="a.id">{{ a.codigo }} — {{ a.nombre }}</option>
          }
        </select>
        @if (intentado && !ingreso.almacen_id) {
          <span class="error">Selecciona el almacén de destino.</span>
        }
      </label>

      <label class="field">
        <span class="theme-label">Número de lote</span>
        <input
          class="theme-input"
          [(ngModel)]="ingreso.numero_lote"
          name="numero-lote"
          maxlength="50"
          placeholder="Ej. L-2026-001"
        />
      </label>

      <label class="field">
        <span class="theme-label">Fecha de vencimiento</span>
        <input
          class="theme-input"
          type="date"
          [(ngModel)]="ingreso.fecha_vencimiento"
          name="fecha-vencimiento"
        />
      </label>

      <div class="fila">
        <label class="field">
          <span class="theme-label">Cantidad</span>
          <input
            class="theme-input"
            type="number"
            min="0.01"
            step="0.01"
            inputmode="decimal"
            [(ngModel)]="ingreso.cantidad"
            name="cantidad"
          />
          @if (intentado && ingreso.cantidad <= 0) {
            <span class="error">La cantidad debe ser mayor a cero.</span>
          }
        </label>

        <label class="field">
          <span class="theme-label">Costo unitario</span>
          <input
            class="theme-input"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            [(ngModel)]="ingreso.costo_unitario"
            name="costo"
          />
        </label>
      </div>

      <label class="field">
        <span class="theme-label">Observación (opcional)</span>
        <textarea
          class="theme-input"
          rows="2"
          maxlength="300"
          [(ngModel)]="ingreso.observacion"
          name="observacion"
          placeholder="Ej. compra según orden 1234"
        ></textarea>
      </label>

      @if (errorForm) {
        <p class="alerta alerta--error" role="alert">{{ errorForm }}</p>
      }

      <button
        type="button"
        class="theme-btn theme-btn--primary"
        (click)="ingresar()"
        [disabled]="guardando"
      >
        {{ guardando ? 'Ingresando…' : 'Ingresar al almacén' }}
      </button>
    </section>
  </div>
  `,
  styles: [`
    .page {
      display: grid;
      gap: var(--theme-space-4);
      padding: var(--theme-space-4);
      max-width: 60rem;
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
    .section-title { margin: 0 0 var(--theme-space-2); }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--theme-space-2);
      margin-bottom: var(--theme-space-2);
    }
    .section-head .section-title { margin: 0; }
    .almacenes { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--theme-space-1); }
    .almacen {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--theme-space-2);
      align-items: center;
      padding: var(--theme-space-1) 0;
      border-bottom: 1px solid var(--theme-border);
    }
    .almacen:last-child { border-bottom: 0; }
    .almacen-codigo { font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); font-variant-numeric: tabular-nums; }
    .almacen-nombre { font-size: var(--theme-font-size-sm); overflow-wrap: anywhere; }
    .lote-card {
      display: grid;
      gap: 2px;
      padding: var(--theme-space-2) 0;
      border-bottom: 1px solid var(--theme-border);
    }
    .lote-card:last-of-type { border-bottom: 0; }
    .lote-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .lote-insumo { margin: 0; font-weight: var(--theme-font-weight-bold); overflow-wrap: anywhere; }
    .lote-pres { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text-muted); }
    .lote-cantidad {
      font-weight: var(--theme-font-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--theme-success);
      white-space: nowrap;
    }
    .lote-cantidad--cero { color: var(--theme-danger-soft); }
    .lote-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-1) var(--theme-space-3);
      margin: 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .form-card { display: grid; gap: var(--theme-space-3); }
    .field { display: grid; gap: var(--theme-space-1); }
    .fila {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--theme-space-2);
    }
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
      margin: 0 0 var(--theme-space-2);
      padding: var(--theme-space-2);
      border-radius: var(--theme-radius-md);
      font-size: var(--theme-font-size-sm);
    }
    .alerta--error { color: var(--theme-danger-soft); background: var(--theme-danger-dim); }
    .alerta--ok { color: var(--theme-success); background: var(--theme-success-dim); }
    .error { color: var(--theme-danger-soft); font-size: var(--theme-font-size-xs); }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class AlmacenesComponent implements OnInit {
  private svc = inject(InsumosService);

  almacenes: Almacen[] = [];
  lotes: Lote[] = [];
  presentacion: Presentacion | null = null;

  ingreso: {
    almacen_id: number | null;
    numero_lote: string;
    fecha_vencimiento: string | null;
    cantidad: number;
    costo_unitario: number;
    observacion: string;
  } = this.ingresoVacio();

  intentado = false;
  guardando = false;
  mensaje = '';
  error = '';
  errorForm = '';

  ngOnInit(): void {
    this.cargarAlmacenes();
    this.cargarLotes();
  }

  cargarAlmacenes(): void {
    this.svc.listarAlmacenes({ limit: 100 }).subscribe({
      next: (r: AlmacenListResponse) => (this.almacenes = r.items),
      error: () => (this.error = 'No se pudieron cargar los almacenes.'),
    });
  }

  cargarLotes(): void {
    this.svc.listarLotes({ limit: 200 }).subscribe({
      next: (r: LoteListResponse) => {
        this.lotes = [...r.items].sort((a, b) => {
          const fa = a.fecha_vencimiento || '9999-12-31';
          const fb = b.fecha_vencimiento || '9999-12-31';
          return fa.localeCompare(fb);
        });
      },
      error: () => (this.error = 'No se pudieron cargar los lotes.'),
    });
  }

  ingresoVacio() {
    return {
      almacen_id: null as number | null,
      numero_lote: '',
      fecha_vencimiento: null as string | null,
      cantidad: 1,
      costo_unitario: 0,
      observacion: '',
    };
  }

  ingresar(): void {
    this.intentado = true;
    this.mensaje = '';
    this.error = '';
    this.errorForm = '';

    if (!this.presentacion) {
      this.errorForm = 'Busca y selecciona la presentación que ingresa.';
      return;
    }
    if (!this.ingreso.almacen_id) {
      this.errorForm = 'Selecciona el almacén de destino.';
      return;
    }
    if (!Number.isFinite(Number(this.ingreso.cantidad)) || Number(this.ingreso.cantidad) <= 0) {
      this.errorForm = 'La cantidad debe ser mayor a cero.';
      return;
    }

    const body: LoteIngresoCreate = {
      presentacion_id: this.presentacion.id,
      almacen_id: this.ingreso.almacen_id,
      numero_lote: this.ingreso.numero_lote.trim(),
      fecha_vencimiento: this.ingreso.fecha_vencimiento || null,
      cantidad: Number(this.ingreso.cantidad),
      costo_unitario: Number(this.ingreso.costo_unitario) || 0,
      observacion: this.ingreso.observacion.trim(),
    };

    this.guardando = true;
    this.svc.ingresarLote(body).subscribe({
      next: (lote) => {
        this.guardando = false;
        this.intentado = false;
        this.mensaje = `Ingreso registrado: ${lote.cantidad_actual} en ${lote.insumo_nombre || 'el lote'}.`;
        this.presentacion = null;
        this.ingreso = this.ingresoVacio();
        this.cargarLotes();
      },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err?.error?.detail || 'No se pudo registrar el ingreso.';
      },
    });
  }

  proximoAVencer(l: Lote): boolean {
    if (!l.fecha_vencimiento) return false;
    const hoy = new Date();
    const venc = new Date(l.fecha_vencimiento);
    const diff = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }

  tipoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      bodega: 'Bodega',
      farmacia: 'Farmacia',
      productos_afines: 'Productos afines',
      servicio: 'Servicio',
    };
    return etiquetas[tipo] || tipo;
  }
}
