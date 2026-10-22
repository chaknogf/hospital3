import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, EMPTY } from 'rxjs';

interface Duplicado {
  id: number;
  nombre: string;
  expediente: string | null;
  cui: number | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
}

interface CacheDuplicados {
  data: Duplicado[];
  ts: number;
  key: string;
}

const CACHE_TTL_MS = 60_000;

@Component({
  selector: 'app-duplicados-pacientes',
  templateUrl: './duplicados-pacientes.component.html',
  styleUrl: './duplicados-pacientes.component.css',
  host: { class: 'admin-ui' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule]
})
export class DuplicadosPacientesComponent {
  private router = inject(Router);
  private api = inject(ApiService);

  duplicados = signal<Duplicado[]>([]);
  seleccionados = signal<Set<number>>(new Set());
  principalId = signal<number | null>(null);

  readonly pageSize = 8;
  pageIndex = signal(0);

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.duplicados().length / this.pageSize));
  }

  get pagedDuplicados(): Duplicado[] {
    const start = this.pageIndex() * this.pageSize;
    return this.duplicados().slice(start, start + this.pageSize);
  }

  similitud = signal(0.85);
  metodo = signal('vectorial');
  incluirFecha = signal(true);

  loading = signal(false);
  refreshing = signal(false);
  merging = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  confirmText = signal('');

  /** Cache en memoria: evita re-consultar el backend mientras no expire. */
  private cache: CacheDuplicados | null = null;

  private get cacheKey(): string {
    return `${this.similitud()}|${this.metodo()}|${this.incluirFecha()}`;
  }

  get cacheVigente(): boolean {
    return !!this.cache
      && this.cache.key === this.cacheKey
      && (Date.now() - this.cache.ts) < CACHE_TTL_MS;
  }

  get todosSeleccionadosValidos(): boolean {
    return this.seleccionados().size >= 2 && this.principalId() !== null
      && this.seleccionados().has(this.principalId()!);
  }

  get puedeFusionar(): boolean {
    return this.todosSeleccionadosValidos && this.confirmText() === 'CONFIRMAR' && !this.merging();
  }

  /**
   * Carga el listado de duplicados.
   * @param forzar si true ignora el cache y consulta el backend.
   * @param segundoPlano si true no muestra spinner de carga (refresco silencioso).
   */
  cargar(forzar = false, segundoPlano = false): void {
    this.error.set(null);
    this.success.set(null);

    // Cache fresco: aplicar sin tocar el backend.
    if (!forzar && this.cacheVigente) {
      this.aplicarLista(this.cache!.data);
      return;
    }

    if (segundoPlano) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
    }

    this.api.getPacientesDuplicadosNombresSimilares({
      similitud_minima: this.similitud(),
      metodo: this.metodo(),
      incluir_fecha_nacimiento: this.incluirFecha(),
      limit: 500,
      offset: 0,
    }).pipe(
      finalize(() => {
        this.loading.set(false);
        this.refreshing.set(false);
      }),
      catchError(err => {
        console.error('error al cargar duplicados: ', err);
        this.error.set(`Error al cargar duplicados: ${err.error?.detail || err.message || 'Error desconocido'}`);
        return EMPTY;
      })
    ).subscribe((res: any) => {
      const lista = (res?.resultados ?? []) as Duplicado[];
      this.cache = { data: lista, ts: Date.now(), key: this.cacheKey };
      this.aplicarLista(lista);
    });
  }

  /** Aplica una lista al estado (sin resetear si es un refresco en segundo plano). */
  private aplicarLista(lista: Duplicado[]): void {
    this.duplicados.set(lista);
    this.seleccionados.set(new Set());
    this.principalId.set(null);
    this.confirmText.set('');
    this.pageIndex.set(0);
  }

  toggle(id: number, checked: boolean): void {
    const s = new Set(this.seleccionados());
    if (checked) s.add(id); else s.delete(id);
    this.seleccionados.set(s);
    if (this.principalId() !== null && !s.has(this.principalId()!)) {
      this.principalId.set(null);
    }
  }

  setPrincipal(id: number): void {
    if (!this.seleccionados().has(id)) {
      const s = new Set(this.seleccionados());
      s.add(id);
      this.seleccionados.set(s);
    }
    this.principalId.set(id);
  }

  isSelected(id: number): boolean {
    return this.seleccionados().has(id);
  }

  onConfirmInput(value: string): void {
    this.confirmText.set((value || '').toUpperCase());
  }

  nextPage(): void {
    if (this.pageIndex() < this.totalPages - 1) this.pageIndex.update(p => p + 1);
  }

  prevPage(): void {
    if (this.pageIndex() > 0) this.pageIndex.update(p => p - 1);
  }

  fusionar(): void {
    const principal = this.principalId();
    if (principal === null) return;
    const ids = [...this.seleccionados()];
    if (ids.length < 2) return;
    if (this.confirmText() !== 'CONFIRMAR') return;

    this.error.set(null);
    this.success.set(null);
    this.merging.set(true);

    const idsUnicos = [...new Set([principal, ...ids])];

    this.api.mergePacientes(principal, idsUnicos).pipe(
      finalize(() => this.merging.set(false)),
      catchError(err => {
        console.error('error al fusionar: ', err);
        this.error.set(`Error al fusionar pacientes: ${err.error?.detail || err.message || 'Error desconocido'}`);
        return EMPTY;
      })
    ).subscribe(() => {
      this.success.set('Pacientes fusionados exitosamente');
      // Invalidar cache y refrescar en segundo plano (no bloquea ni vuelve a
      // mostrar el spinner grande). El resto del listado se mantiene visible.
      this.cache = null;
      this.cargar(true, true);
    });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }

  ngOnInit(): void {
    this.cargar();
  }
}
