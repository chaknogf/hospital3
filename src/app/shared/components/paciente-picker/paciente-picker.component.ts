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

import { PacienteService } from '../../../registros/patient/paciente.service';
import { PacienteListResponse, PacienteResumen } from '../../../interface/interfaces';

/**
 * Buscador de pacientes por nombre, CUI o expediente.
 *
 * Reutiliza `PacienteService` para conservar la caché offline y el formato
 * de respuesta ya usado en recepción.
 *
 * Uso: `<app-paciente-picker [(paciente)]="form.paciente" />`
 */
@Component({
  selector: 'app-paciente-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (paciente) {
      <div class="picked">
        <div class="picked-body">
          <p class="picked-title">{{ nombreCompleto(paciente) }}</p>
          <p class="picked-sub">
            @if (paciente.expediente) {
              <span>Exp. {{ paciente.expediente }}</span>
            }
            @if (paciente.cui) {
              <span> · CUI {{ paciente.cui }}</span>
            }
            @if (paciente.sexo) {
              <span> · {{ paciente.sexo === 'F' ? 'Femenino' : paciente.sexo === 'M' ? 'Masculino' : paciente.sexo }}</span>
            }
          </p>
        </div>
        <button
          type="button"
          class="theme-btn theme-btn--ghost"
          (click)="limpiar()"
          aria-label="Quitar paciente seleccionado"
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
          aria-label="Buscar paciente por nombre, CUI o expediente"
        />
        @if (cargando()) {
          <p class="hint" aria-live="polite">Buscando pacientes…</p>
        } @else if (texto.length >= 2 && resultados().length === 0) {
          <p class="hint" aria-live="polite">
            Sin coincidencias. Prueba con nombre, CUI o número de expediente.
          </p>
        } @else if (texto.length < 2) {
          <p class="hint">Escribe al menos 2 letras, el CUI o el expediente.</p>
        }

        @if (resultados().length) {
          <ul class="lista" role="listbox" aria-label="Pacientes encontrados">
            @for (p of resultados(); track p.id) {
              <li>
                <button type="button" class="opcion" role="option" (click)="elegir(p)">
                  <span class="opcion-main">{{ nombreCompleto(p) }}</span>
                  <span class="opcion-sub">
                    @if (p.expediente) {
                      <span>Exp. {{ p.expediente }}</span>
                    }
                    @if (p.cui) {
                      <span> · CUI {{ p.cui }}</span>
                    }
                    @if (p.fecha_nacimiento) {
                      <span> · Nac. {{ p.fecha_nacimiento }}</span>
                    }
                  </span>
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
      color: var(--theme-text-muted);
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
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class PacientePickerComponent {
  private svc = inject(PacienteService);
  private readonly terminos = new Subject<string>();

  @Input() paciente: PacienteResumen | null = null;
  @Input() placeholder = 'Buscar paciente por nombre, CUI o expediente…';
  @Output() pacienteChange = new EventEmitter<PacienteResumen | null>();

  readonly resultados = signal<PacienteResumen[]>([]);
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
            return of([] as PacienteResumen[]);
          }
          this.cargando.set(true);
          return this.svc.getPacientes({ q, limit: 20 }).pipe(
            map((r: PacienteListResponse) => r.pacientes ?? []),
            catchError(() => of([] as PacienteResumen[])),
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

  nombreCompleto(p: PacienteResumen): string {
    if (p.nombre_completo) return p.nombre_completo;
    const n = p.nombre;
    if (!n) return `Paciente #${p.id}`;
    return [
      n.primer_nombre,
      n.segundo_nombre,
      n.otro_nombre,
      n.primer_apellido,
      n.segundo_apellido,
      n.apellido_casada,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  elegir(paciente: PacienteResumen): void {
    this.pacienteChange.emit(paciente);
    this.texto = '';
    this.resultados.set([]);
  }

  limpiar(): void {
    this.pacienteChange.emit(null);
    this.texto = '';
    this.resultados.set([]);
  }
}
