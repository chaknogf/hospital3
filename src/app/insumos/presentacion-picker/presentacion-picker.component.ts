import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InsumosService } from '../insumos.service';
import { Presentacion } from '../insumos.model';

/**
 * Buscador de presentaciones de insumos.
 *
 * El catálogo tiene miles de filas, así que la búsqueda es server-side y
 * debounced: el usuario escribe el nombre del insumo (o su código) y el
 * backend devuelve las presentaciones ya con las etiquetas resueltas.
 *
 * Uso: `<app-presentacion-picker [(presentacion)]="linea.presentacion" />`
 */
@Component({
  selector: 'app-presentacion-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (presentacion) {
      <div class="picked">
        <div class="picked-body">
          <p class="picked-title">{{ presentacion.insumo_nombre || presentacion.nombre }}</p>
          <p class="picked-sub">
            {{ presentacion.nombre }}
            @if (presentacion.cantidad_unidad) {
              <span> · {{ presentacion.cantidad_unidad }}</span>
            }
          </p>
          <p class="picked-code">Código {{ presentacion.codigo_presentacion }}</p>
        </div>
        <button
          type="button"
          class="theme-btn theme-btn--ghost"
          (click)="limpiar()"
          aria-label="Quitar presentación seleccionada"
        >
          Quitar
        </button>
      </div>
    } @else {
      <div class="buscador">
        <input
          class="theme-input"
          type="search"
          [(ngModel)]="texto"
          (ngModelChange)="buscar($event)"
          [placeholder]="placeholder"
          autocomplete="off"
          spellcheck="false"
          aria-label="Buscar insumo o presentación"
        />
        @if (cargando()) {
          <p class="hint" aria-live="polite">Buscando presentaciones…</p>
        } @else if (texto.length >= 2 && resultados().length === 0) {
          <p class="hint" aria-live="polite">
            Sin coincidencias. Prueba con el nombre del insumo o su código.
          </p>
        } @else if (texto.length < 2) {
          <p class="hint">Escribe al menos 2 letras del insumo (ej. “acetaminofén”).</p>
        }

        @if (resultados().length) {
          <ul class="lista" role="listbox" aria-label="Presentaciones encontradas">
            @for (p of resultados(); track p.id) {
              <li>
                <button
                  type="button"
                  class="opcion"
                  role="option"
                  (click)="elegir(p)"
                >
                  <span class="opcion-main">{{ p.insumo_nombre || p.nombre }}</span>
                  <span class="opcion-sub">
                    {{ p.nombre }}
                    @if (p.cantidad_unidad) {
                      <span> · {{ p.cantidad_unidad }}</span>
                    }
                  </span>
                  <span class="opcion-code">{{ p.codigo_presentacion }}</span>
                </button>
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .picked {
      display: flex;
      gap: var(--theme-space-2);
      align-items: center;
      justify-content: space-between;
      padding: var(--theme-space-2);
      border: var(--theme-border-width) solid var(--theme-primary);
      border-radius: var(--theme-radius-md);
      background: var(--theme-primary-dim);
    }
    .picked-body { min-width: 0; }
    .picked-title {
      margin: 0;
      font-weight: var(--theme-font-weight-bold);
      color: var(--theme-text);
      overflow-wrap: anywhere;
    }
    .picked-sub {
      margin: 0;
      font-size: var(--theme-font-size-sm);
      color: var(--theme-text);
      overflow-wrap: anywhere;
    }
    .picked-code {
      margin: 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
      font-variant-numeric: tabular-nums;
    }
    .hint {
      margin: var(--theme-space-1) 0 0;
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
    }
    .lista {
      list-style: none;
      margin: var(--theme-space-1) 0 0;
      padding: 0;
      max-height: 18rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      border: var(--theme-border-width) solid var(--theme-border);
      border-radius: var(--theme-radius-md);
      background: var(--theme-surface-raised);
    }
    .opcion {
      display: grid;
      gap: 2px;
      width: 100%;
      min-height: var(--theme-touch-min);
      padding: var(--theme-space-2);
      border: 0;
      border-bottom: var(--theme-border-width) solid var(--theme-border);
      background: transparent;
      color: var(--theme-text);
      font-family: var(--theme-font-ui);
      text-align: left;
      cursor: pointer;
    }
    .opcion:last-child { border-bottom: 0; }
    .opcion:hover,
    .opcion:focus-visible {
      background: var(--theme-primary-dim);
      outline: none;
    }
    .opcion-main { font-weight: var(--theme-font-weight-bold); }
    .opcion-sub {
      font-size: var(--theme-font-size-sm);
      color: var(--theme-text-muted);
    }
    .opcion-code {
      font-size: var(--theme-font-size-xs);
      color: var(--theme-text-muted);
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class PresentacionPickerComponent {
  private svc = inject(InsumosService);
  private readonly terminos = new Subject<string>();

  @Input() presentacion: Presentacion | null = null;
  @Input() placeholder = 'Buscar insumo o presentación…';
  @Output() presentacionChange = new EventEmitter<Presentacion | null>();

  readonly resultados = signal<Presentacion[]>([]);
  readonly cargando = signal(false);
  texto = '';

  constructor() {
    this.terminos
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termino) => {
          const q = (termino || '').trim();
          if (q.length < 2) {
            this.cargando.set(false);
            return of([] as Presentacion[]);
          }
          this.cargando.set(true);
          return this.svc.listarPresentaciones({ q, limit: 20, activo: true }).pipe(
            map((r) => r.items),
            catchError(() => of([] as Presentacion[])),
            finalize(() => this.cargando.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((items) => this.resultados.set(items));
  }

  buscar(valor: string): void {
    this.terminos.next(valor ?? '');
  }

  elegir(presentacion: Presentacion): void {
    this.presentacionChange.emit(presentacion);
    this.texto = '';
    this.resultados.set([]);
  }

  limpiar(): void {
    this.presentacionChange.emit(null);
    this.texto = '';
    this.resultados.set([]);
  }
}
