import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { PresentacionPickerComponent } from '../../insumos/presentacion-picker/presentacion-picker.component';
import { PacientePickerComponent } from '../../shared/components/paciente-picker/paciente-picker.component';
import {
  Almacen,
  AlmacenListResponse,
  Despacho,
  DespachoCreate,
  DespachoListResponse,
  Lote,
  LoteListResponse,
  Presentacion,
} from '../../insumos/insumos.model';
import { PacienteResumen } from '../../interface/interfaces';

interface ServicioOption {
  id: number;
  nombre_servicio?: string;
  nombre?: string;
  codigo?: string;
  activo?: boolean;
}

interface LineaDespacho {
  lote: Lote;
  presentacion: Presentacion;
  cantidad: number;
}

/**
 * Despachos de farmacia/almacén.
 *
 * Sustituye los IDs crudos por selectores legibles: almacenes y servicios por
 * nombre, paciente por búsqueda y lotes con vencimiento y stock (FEFO).
 */
@Component({
  selector: 'app-despachos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PresentacionPickerComponent, PacientePickerComponent],
  template: `
  <div class="page">
    <header class="page-head">
      <div>
        <p class="eyebrow">Farmacia · Despachos</p>
        <h2>Despachos de almacén</h2>
        <p class="muted">Prepara el despacho por lote y ejecútalo cuando el stock esté confirmado.</p>
      </div>
      <button type="button" class="theme-btn theme-btn--primary" (click)="abrirForm()">
        Nuevo despacho
      </button>
    </header>

    @if (mostrarForm) {
      <section class="theme-card form-card" aria-label="Nuevo despacho">
        <div class="field">
          <span class="theme-label">Tipo de despacho</span>
          <div class="tipos" role="group" aria-label="Tipo de despacho">
            @for (t of tipos; track t.valor) {
              <button
                type="button"
                class="chip"
                [class.chip--activo]="form.tipo === t.valor"
                [attr.aria-pressed]="form.tipo === t.valor"
                (click)="cambiarTipo(t.valor)"
              >
                {{ t.etiqueta }}
              </button>
            }
          </div>
        </div>

        <label class="field">
          <span class="theme-label">Almacén de origen</span>
          <select
            class="theme-input"
            [(ngModel)]="form.almacen_origen_id"
            name="almacen-origen"
            (ngModelChange)="onAlmacenChange()"
          >
            <option [ngValue]="null">Selecciona el almacén</option>
            @for (a of almacenes; track a.id) {
              <option [ngValue]="a.id">{{ a.codigo }} — {{ a.nombre }}</option>
            }
          </select>
        </label>

        @if (form.tipo === 'traslado') {
          <label class="field">
            <span class="theme-label">Almacén de destino</span>
            <select class="theme-input" [(ngModel)]="form.almacen_destino_id" name="almacen-destino">
              <option [ngValue]="null">Selecciona el almacén destino</option>
              @for (a of almacenes; track a.id) {
                @if (a.id !== form.almacen_origen_id) {
                  <option [ngValue]="a.id">{{ a.codigo }} — {{ a.nombre }}</option>
                }
              }
            </select>
          </label>
        }

        @if (form.tipo === 'servicio') {
          <label class="field">
            <span class="theme-label">Servicio de destino</span>
            <select class="theme-input" [(ngModel)]="form.servicio_destino_id" name="servicio-destino">
              <option [ngValue]="null">Selecciona el servicio</option>
              @for (s of servicios; track s.id) {
                <option [ngValue]="s.id">{{ nombreServicio(s) }}</option>
              }
            </select>
          </label>
        }

        @if (form.tipo === 'paciente') {
          <div class="field">
            <span class="theme-label">Paciente de destino</span>
            <app-paciente-picker [(paciente)]="form.paciente" />
          </div>
        }

        <div class="field lineas-box">
          <span class="theme-label">Insumos del despacho</span>

          <app-presentacion-picker
            [presentacion]="linea.presentacion"
            (presentacionChange)="onPresentacionChange($event)"
          />

          @if (linea.presentacion) {
            @if (cargandoLotes()) {
              <p class="hint" aria-live="polite">Cargando lotes disponibles…</p>
            } @else if (!lotes.length) {
              <p class="hint">
                No hay lotes con existencia en el almacén seleccionado para esta presentación.
              </p>
            } @else {
              <label class="field">
                <span class="theme-label">Lote (FEFO: primero vence, primero sale)</span>
                <select class="theme-input" [(ngModel)]="linea.lote_id" name="lote">
                  <option [ngValue]="null">Selecciona el lote</option>
                  @for (l of lotes; track l.id) {
                    <option [ngValue]="l.id">
                      {{ l.numero_lote }} · vence {{ l.fecha_vencimiento || 'sin fecha' }} · stock
                      {{ l.cantidad_actual | number:'1.0-2' }}
                    </option>
                  }
                </select>
              </label>
            }

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
                  name="cantidad-despacho"
                />
              </label>
              <button
                type="button"
                class="theme-btn theme-btn--primary"
                (click)="agregarLinea()"
                [disabled]="!linea.lote_id || linea.cantidad <= 0"
              >
                Agregar
              </button>
            </div>
          }
        </div>

        @if (form.detalles.length) {
          <ul class="lineas" aria-label="Lotes agregados">
            @for (l of form.detalles; track l.lote.id; let i = $index) {
              <li class="linea">
                <div class="linea-info">
                  <p class="linea-title">{{ l.presentacion.insumo_nombre || l.presentacion.nombre }}</p>
                  <p class="linea-sub">
                    Lote {{ l.lote.numero_lote }} · {{ l.presentacion.nombre }}
                    @if (l.presentacion.cantidad_unidad) {
                      <span> · {{ l.presentacion.cantidad_unidad }}</span>
                    }
                  </p>
                  <p class="linea-code">
                    Vence {{ l.lote.fecha_vencimiento || 'sin fecha' }}
                    · Código {{ l.presentacion.codigo_presentacion }}
                  </p>
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
                      [name]="'desp-cant-' + i"
                    />
                  </label>
                  <button
                    type="button"
                    class="theme-btn theme-btn--ghost"
                    (click)="quitarLinea(i)"
                    [attr.aria-label]="'Quitar lote ' + l.lote.numero_lote"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">Agrega al menos un lote para preparar el despacho.</p>
        }

        <label class="field">
          <span class="theme-label">Observaciones (opcional)</span>
          <textarea
            class="theme-input"
            rows="2"
            maxlength="500"
            [(ngModel)]="form.observaciones"
            name="observaciones-despacho"
            placeholder="Ej. entrega en turno de la tarde"
          ></textarea>
        </label>

        @if (errorForm) {
          <p class="alerta alerta--error" role="alert">{{ errorForm }}</p>
        }

        <div class="acciones">
          <button
            type="button"
            class="theme-btn theme-btn--primary"
            (click)="guardar()"
            [disabled]="guardando"
          >
            {{ guardando ? 'Creando…' : 'Crear despacho' }}
          </button>
          <button type="button" class="theme-btn" (click)="cerrarForm()" [disabled]="guardando">
            Cancelar
          </button>
        </div>
      </section>
    }

    @if (mensaje) {
      <p class="alerta alerta--ok" role="status">{{ mensaje }}</p>
    }
    @if (error) {
      <p class="alerta alerta--error" role="alert">{{ error }}</p>
    }

    <section class="lista-despachos" aria-label="Despachos registrados">
      @if (!items.length) {
        <p class="empty">No hay despachos registrados.</p>
      }

      @for (d of items; track d.id) {
        <article class="desp-card">
          <div class="desp-head">
            <div>
              <p class="desp-numero">{{ d.numero }}</p>
              <p class="desp-tipo">{{ tipoTexto(d.tipo) }}</p>
            </div>
            <div class="desp-head-actions">
              <span class="theme-badge" [ngClass]="claseEstado(d.estado)">{{ estadoTexto(d.estado) }}</span>
              <a class="theme-btn" [routerLink]="['/farmacia/despachos', d.id, 'imprimir']">
                Imprimir
              </a>
            </div>
          </div>

          <div class="desp-meta">
            <span>Origen: {{ d.almacen_origen_nombre || 'Almacén sin nombre' }}</span>
            <span>Destino: {{ destinoTexto(d) }}</span>
            <span>{{ d.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <ul class="desp-detalles">
            @for (det of d.detalles; track det.id) {
              <li>
                <div class="detalle-info">
                  <span class="detalle-insumo">{{ det.insumo_nombre || det.presentacion_nombre || 'Presentación' }}</span>
                  <span class="detalle-pres">
                    Lote {{ det.lote_numero }} · {{ det.presentacion_codigo }} · {{ det.presentacion_nombre }}
                  </span>
                </div>
                <span class="detalle-cantidad">{{ det.cantidad | number:'1.0-2' }}</span>
              </li>
            }
          </ul>

          @if (d.observaciones) {
            <p class="desp-obs">Observaciones: {{ d.observaciones }}</p>
          }

          @if (esJefe && d.estado === 'borrador') {
            <div class="acciones">
              <button
                type="button"
                class="theme-btn theme-btn--primary"
                (click)="despachar(d)"
                [disabled]="procesandoId === d.id"
              >
                {{ procesandoId === d.id ? 'Despachando…' : 'Despachar' }}
              </button>
              <button
                type="button"
                class="theme-btn theme-btn--ghost peligro"
                (click)="anular(d)"
                [disabled]="procesandoId === d.id"
              >
                Anular
              </button>
            </div>
          }
        </article>
      }
    </section>
  </div>
  `,
  styles: [`
    .page {
      display: grid;
      gap: var(--theme-space-3);
      padding: var(--theme-space-4);
      max-width: 60rem;
      margin-inline: auto;
    }
    .page-head {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-2);
      align-items: start;
      justify-content: space-between;
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
    .tipos { display: flex; flex-wrap: wrap; gap: var(--theme-space-2); }
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
    .lineas-box {
      gap: var(--theme-space-2);
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface-raised);
    }
    .cantidad-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--theme-space-2);
      align-items: end;
    }
    .lineas { list-style: none; display: grid; gap: var(--theme-space-2); margin: 0; padding: 0; }
    .linea {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-2);
      align-items: center;
      justify-content: space-between;
      padding: var(--theme-space-2);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .linea-info { min-width: 0; flex: 1 1 14rem; }
    .linea-title { margin: 0; font-weight: var(--theme-font-weight-bold); overflow-wrap: anywhere; }
    .linea-sub { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .linea-code { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .linea-actions { display: flex; gap: var(--theme-space-2); align-items: end; }
    .cantidad-mini { display: grid; gap: 2px; width: 6rem; }
    .hint { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    .empty {
      margin: 0;
      padding: var(--theme-space-3);
      border: 1px dashed var(--theme-border);
      border-radius: var(--theme-radius-md);
      color: var(--theme-text-muted);
      font-size: var(--theme-font-size-sm);
      text-align: center;
    }
    .acciones { display: flex; flex-wrap: wrap; gap: var(--theme-space-2); }
    .peligro { color: var(--theme-danger-soft); }
    .alerta {
      margin: 0;
      padding: var(--theme-space-2);
      border-radius: var(--theme-radius-md);
      font-size: var(--theme-font-size-sm);
    }
    .alerta--error { color: var(--theme-danger-soft); background: var(--theme-danger-dim); }
    .alerta--ok { color: var(--theme-success); background: var(--theme-success-dim); }
    .lista-despachos { display: grid; gap: var(--theme-space-2); }
    .desp-card {
      display: grid;
      gap: var(--theme-space-2);
      padding: var(--theme-space-3);
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface);
    }
    .desp-head { display: flex; gap: var(--theme-space-2); align-items: start; justify-content: space-between; }
    .desp-head-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-2);
      align-items: center;
      justify-content: flex-end;
    }
    .desp-numero { margin: 0; font-weight: var(--theme-font-weight-bold); font-variant-numeric: tabular-nums; }
    .desp-tipo { margin: 0; font-size: var(--theme-font-size-sm); color: var(--theme-text); }
    .desp-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--theme-space-1) var(--theme-space-3);
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .desp-detalles { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .desp-detalles li {
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
    .desp-obs { margin: 0; font-size: var(--theme-font-size-xs); color: var(--theme-text-muted); }
    @media (min-width: 48rem) {
      .form-card { grid-template-columns: 1fr 1fr; }
      .form-card > .field:first-child,
      .form-card > .lineas-box,
      .form-card > .lineas,
      .form-card > .empty,
      .form-card > .alerta,
      .form-card > .acciones { grid-column: 1 / -1; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `],
})
export class DespachosComponent implements OnInit {
  private svc = inject(InsumosService);
  private auth = inject(AuthService);

  items: Despacho[] = [];
  almacenes: Almacen[] = [];
  servicios: ServicioOption[] = [];
  lotes: Lote[] = [];

  readonly tipos = [
    { valor: 'servicio', etiqueta: 'A servicio' },
    { valor: 'paciente', etiqueta: 'A paciente' },
    { valor: 'traslado', etiqueta: 'Traslado entre almacenes' },
  ] as const;

  mostrarForm = false;
  guardando = false;
  readonly cargandoLotes = signal(false);
  procesandoId: number | null = null;
  mensaje = '';
  error = '';
  errorForm = '';

  form: {
    tipo: 'servicio' | 'paciente' | 'traslado';
    almacen_origen_id: number | null;
    almacen_destino_id: number | null;
    servicio_destino_id: number | null;
    paciente: PacienteResumen | null;
    observaciones: string;
    detalles: LineaDespacho[];
  } = this.formVacio();

  linea: { presentacion: Presentacion | null; lote_id: number | null; cantidad: number } =
    this.lineaVacia();

  get esJefe(): boolean {
    const r = this.auth.getUsuarioActual().role;
    return r === 'admin' || r === 'jefe_farmacia';
  }

  ngOnInit(): void {
    this.cargar();
    this.svc.listarAlmacenes({ limit: 100 }).subscribe({
      next: (r: AlmacenListResponse) => (this.almacenes = r.items),
      error: () => (this.error = 'No se pudieron cargar los almacenes.'),
    });
    this.svc.listarServicios().subscribe({
      next: (r) => {
        const lista = Array.isArray(r) ? r : (r?.items || []);
        this.servicios = lista.filter((s: ServicioOption) => s.activo !== false);
      },
      error: () => (this.servicios = []),
    });
  }

  formVacio() {
    return {
      tipo: 'servicio' as const,
      almacen_origen_id: null,
      almacen_destino_id: null,
      servicio_destino_id: null,
      paciente: null,
      observaciones: '',
      detalles: [] as LineaDespacho[],
    };
  }

  lineaVacia() {
    return { presentacion: null as Presentacion | null, lote_id: null as number | null, cantidad: 1 };
  }

  cargar(): void {
    this.svc.listarDespachos({ limit: 100 }).subscribe({
      next: (r: DespachoListResponse) => (this.items = r.items),
      error: () => (this.error = 'No se pudieron cargar los despachos.'),
    });
  }

  abrirForm(): void {
    this.mostrarForm = true;
    this.form = this.formVacio();
    this.linea = this.lineaVacia();
    this.lotes = [];
    this.errorForm = '';
    this.mensaje = '';
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.errorForm = '';
  }

  cambiarTipo(tipo: 'servicio' | 'paciente' | 'traslado'): void {
    this.form.tipo = tipo;
    this.form.almacen_destino_id = null;
    this.form.servicio_destino_id = null;
    this.form.paciente = null;
    this.errorForm = '';
  }

  nombreServicio(s: ServicioOption): string {
    return s.nombre_servicio || s.nombre || s.codigo || `Servicio #${s.id}`;
  }

  onAlmacenChange(): void {
    // Los lotes dependen del almacén: si cambia, hay que volver a consultarlos.
    if (this.linea.presentacion) {
      this.cargarLotes(this.linea.presentacion);
    }
  }

  onPresentacionChange(presentacion: Presentacion | null): void {
    this.linea.presentacion = presentacion;
    this.linea.lote_id = null;
    this.lotes = [];
    if (presentacion) {
      this.cargarLotes(presentacion);
    }
  }

  private cargarLotes(presentacion: Presentacion): void {
    if (!this.form.almacen_origen_id) {
      this.lotes = [];
      return;
    }
    this.cargandoLotes.set(true);
    this.svc
      .listarLotes({
        presentacion_id: presentacion.id,
        almacen_id: this.form.almacen_origen_id,
        con_stock: true,
        limit: 100,
      })
      .subscribe({
        next: (r: LoteListResponse) => {
          this.cargandoLotes.set(false);
          this.lotes = [...r.items].sort((a, b) => {
            const fa = a.fecha_vencimiento || '9999-12-31';
            const fb = b.fecha_vencimiento || '9999-12-31';
            return fa.localeCompare(fb);
          });
          // FEFO: preseleccionar el lote que vence primero.
          this.linea.lote_id = this.lotes.length ? this.lotes[0].id : null;
        },
        error: () => {
          this.cargandoLotes.set(false);
          this.lotes = [];
          this.errorForm = 'No se pudieron cargar los lotes del almacén.';
        },
      });
  }

  agregarLinea(): void {
    const presentacion = this.linea.presentacion;
    const lote = this.lotes.find((l) => l.id === this.linea.lote_id);
    const cantidad = Number(this.linea.cantidad);
    if (!presentacion || !lote || !Number.isFinite(cantidad) || cantidad <= 0) return;

    const yaAgregado = this.form.detalles
      .filter((d) => d.lote.id === lote.id)
      .reduce((total, d) => total + Number(d.cantidad), 0);
    const disponible = Number(lote.cantidad_actual) - yaAgregado;
    if (cantidad > disponible) {
      this.errorForm = `El lote ${lote.numero_lote} solo tiene ${disponible} disponible(s).`;
      return;
    }

    const existente = this.form.detalles.find((d) => d.lote.id === lote.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.form.detalles = [...this.form.detalles, { lote, presentacion, cantidad }];
    }

    this.linea = this.lineaVacia();
    this.lotes = [];
    this.errorForm = '';
    this.mensaje = '';
  }

  quitarLinea(index: number): void {
    this.form.detalles = this.form.detalles.filter((_, i) => i !== index);
  }

  guardar(): void {
    this.errorForm = '';
    this.mensaje = '';

    if (!this.form.almacen_origen_id) {
      this.errorForm = 'Selecciona el almacén de origen.';
      return;
    }
    if (!this.form.detalles.length) {
      this.errorForm = 'Agrega al menos un lote al despacho.';
      return;
    }
    if (this.form.tipo === 'traslado') {
      if (!this.form.almacen_destino_id) {
        this.errorForm = 'Selecciona el almacén de destino.';
        return;
      }
      if (this.form.almacen_destino_id === this.form.almacen_origen_id) {
        this.errorForm = 'El almacén de destino debe ser distinto al de origen.';
        return;
      }
    }
    if (this.form.tipo === 'servicio' && !this.form.servicio_destino_id) {
      this.errorForm = 'Selecciona el servicio de destino.';
      return;
    }
    if (this.form.tipo === 'paciente' && !this.form.paciente) {
      this.errorForm = 'Selecciona el paciente de destino.';
      return;
    }
    if (this.form.detalles.some((d) => Number(d.cantidad) <= 0)) {
      this.errorForm = 'Todas las cantidades deben ser mayores a cero.';
      return;
    }

    const body: DespachoCreate = {
      tipo: this.form.tipo,
      almacen_origen_id: this.form.almacen_origen_id,
      almacen_destino_id: this.form.almacen_destino_id ?? undefined,
      servicio_destino_id: this.form.servicio_destino_id ?? undefined,
      paciente_id: this.form.paciente?.id ?? undefined,
      observaciones: this.form.observaciones.trim(),
      detalles: this.form.detalles.map((d) => ({
        lote_id: d.lote.id,
        cantidad: Number(d.cantidad),
        costo_unitario: 0,
      })),
    };

    this.guardando = true;
    this.svc.crearDespacho(body).subscribe({
      next: (despacho) => {
        this.guardando = false;
        this.mostrarForm = false;
        this.mensaje = `Despacho ${despacho.numero} creado en borrador.`;
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err?.error?.detail || 'No se pudo crear el despacho.';
      },
    });
  }

  despachar(despacho: Despacho): void {
    this.procesandoId = despacho.id;
    this.mensaje = '';
    this.error = '';
    this.svc.despachar(despacho.id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensaje = `Despacho ${despacho.numero} ejecutado. El stock ya fue descontado.`;
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo ejecutar el despacho.';
      },
    });
  }

  anular(despacho: Despacho): void {
    this.procesandoId = despacho.id;
    this.mensaje = '';
    this.error = '';
    this.svc.anularDespacho(despacho.id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensaje = `Despacho ${despacho.numero} anulado.`;
        this.cargar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.error = err?.error?.detail || 'No se pudo anular el despacho.';
      },
    });
  }

  tipoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      servicio: 'Despacho a servicio',
      paciente: 'Despacho a paciente',
      traslado: 'Traslado entre almacenes',
    };
    return etiquetas[tipo] || tipo;
  }

  destinoTexto(d: Despacho): string {
    if (d.tipo === 'traslado') return d.almacen_destino_nombre || 'Almacén sin nombre';
    if (d.tipo === 'paciente') return d.paciente_nombre || 'Paciente sin nombre';
    return d.servicio_destino_nombre || 'Servicio sin nombre';
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      borrador: 'Borrador',
      despachado: 'Despachado',
      anulado: 'Anulado',
    };
    return etiquetas[estado] || estado;
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      borrador: 'theme-badge--warning',
      despachado: 'theme-badge--success',
      anulado: 'theme-badge--danger',
    };
    return clases[estado] || 'theme-badge--primary';
  }
}
