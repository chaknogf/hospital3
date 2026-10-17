import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CatalogoService } from '../../../service/catalogo.service';
import { environment } from '../../../../environments/environment';
import { CatalogoProcedimiento } from '../../../interface/procedimientos';

interface Especialidad {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-gestion-procedimientos',
  templateUrl: './gestion-procedimientos.component.html',
  host: { class: 'admin-ui' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
/** Administra el catálogo maestro de procedimientos
 *  (`catalogo_procedimientos`). */
export class GestionProcedimientosComponent implements OnDestroy {
  private router = inject(Router);
  private catalogo = inject(CatalogoService);
  private http = inject(HttpClient);

  private destroy$ = new Subject<void>();

  catalogoProcedimientos = signal<CatalogoProcedimiento[]>([]);
  especialidades = signal<Especialidad[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtro = signal<string>('');
  especialidadFiltro = signal<number | null>(null);

  mostrarFormulario = signal(false);
  editando = signal<boolean>(false);
  guardando = signal(false);

  formEspecialidades = signal<number[]>([]);
  formProcedimiento = signal('');
  formCodigo = signal('');
  formDescripcion = signal('');
  formAnestesia = signal(0);

  idOriginal = signal<number | null>(null);
  confirmarEliminar = signal<number | null>(null);

  constructor() {
    this.cargar();
    this.cargarEspecialidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtros: any = { activo: true, limit: 5000 };
    const texto = this.filtro();
    const esp = this.especialidadFiltro();
    if (texto) filtros.q = texto;
    if (esp) filtros.especialidad_ref = esp;

    this.catalogo.getCatalogoProcedimientos(filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.catalogoProcedimientos.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el catálogo de procedimientos');
        this.loading.set(false);
      }
    });
  }

  cargarEspecialidades(): void {
    this.http.get<Especialidad[]>(`${environment.apiUrl}/especialidades/`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.especialidades.set(res),
        error: () => {}
      });
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.idOriginal.set(null);
    this.formEspecialidades.set([]);
    this.formProcedimiento.set('');
    this.formCodigo.set('');
    this.formDescripcion.set('');
    this.formAnestesia.set(0);
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(c: CatalogoProcedimiento): void {
    this.editando.set(true);
    this.idOriginal.set(c.id);
    this.formEspecialidades.set(
      c.especialidades_ids?.length
        ? [...c.especialidades_ids]
        : (c.especialidad_ref != null ? [c.especialidad_ref] : [])
    );
    this.formProcedimiento.set(c.nombre);
    this.formCodigo.set(c.abreviatura ?? '');
    this.formDescripcion.set(c.descripcion ?? '');
    this.formAnestesia.set(c.anestesia ?? 0);
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  /** Marca/desmarca una especialidad en el formulario. */
  toggleEspecialidad(id: number): void {
    this.formEspecialidades.update(lista =>
      lista.includes(id) ? lista.filter(x => x !== id) : [...lista, id]
    );
  }

  /** Indica si una especialidad está seleccionada en el formulario. */
  especialidadSeleccionada(id: number): boolean {
    return this.formEspecialidades().includes(id);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  guardar(): void {
    const procedimiento = this.formProcedimiento().trim();
    if (!procedimiento) {
      this.error.set('El nombre del procedimiento es requerido');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: Partial<CatalogoProcedimiento> = {
      nombre: procedimiento,
      abreviatura: this.formCodigo().trim() || undefined,
      descripcion: this.formDescripcion().trim() || undefined,
      anestesia: this.formAnestesia(),
      especialidades_ids: this.formEspecialidades(),
      activo: true
    };

    const obs = this.editando() && this.idOriginal()
      ? this.catalogo.actualizarCatalogoProcedimiento(this.idOriginal()!, payload)
      : this.catalogo.crearCatalogoProcedimiento(payload);

    obs.pipe(finalize(() => this.guardando.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set(this.editando() ? 'Procedimiento actualizado' : 'Procedimiento creado');
        this.mostrarFormulario.set(false);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al guardar el procedimiento');
      }
    });
  }

  confirmarEliminacion(id: number): void {
    this.confirmarEliminar.set(id);
  }

  cancelarEliminacion(): void {
    this.confirmarEliminar.set(null);
  }

  eliminar(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.catalogo.eliminarCatalogoProcedimiento(id).pipe(
      finalize(() => this.loading.set(false)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.success.set('Procedimiento desactivado');
        this.confirmarEliminar.set(null);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al eliminar el procedimiento');
        this.confirmarEliminar.set(null);
      }
    });
  }

  /** Nombres de todas las especialidades habilitadas para un procedimiento. */
  nombresEspecialidades(c: CatalogoProcedimiento): string {
    const ids = c.especialidades_ids?.length
      ? c.especialidades_ids
      : (c.especialidad_ref != null ? [c.especialidad_ref] : []);
    if (!ids.length) return 'Sin especialidad';
    return ids
      .map(id => this.especialidades().find(e => e.id === id)?.nombre ?? `#${id}`)
      .join(', ');
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}