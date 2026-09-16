import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { catchError, finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { QuirofanoService } from '../../../medica/quirofano/quirofano.service';
import { TipoProcedimiento, CategoriaProcedimiento } from '../../../interface/quirofano.interface';

@Component({
  selector: 'app-gestion-procedimientos',
  templateUrl: './gestion-procedimientos.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class GestionProcedimientosComponent implements OnDestroy {
  private router = inject(Router);
  private api = inject(QuirofanoService);

  private destroy$ = new Subject<void>();

  tipos = signal<TipoProcedimiento[]>([]);
  categorias = signal<CategoriaProcedimiento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtro = signal<string>('');
  categoriaFiltro = signal<number | null>(null);

  mostrarFormulario = signal(false);
  editando = signal<boolean>(false);
  guardando = signal(false);

  formCategoriaId = signal<number | null>(null);
  formProcedimiento = signal('');
  formCodigo = signal('');

  idOriginal = signal<number | null>(null);

  confirmarEliminar = signal<number | null>(null);

  // Import CSV
  importando = signal(false);
  resultadoImport = signal<{ creados: number; omitidos: number; errores: any[] } | null>(null);

  constructor() {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: any = { activos: true, limit: 5000 };
    const q = this.filtro();
    const cat = this.categoriaFiltro();
    if (q) params.q = q;
    if (cat) params.categoria_id = cat;

    this.api.getTiposProcedimiento(cat ?? undefined, q || undefined).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.tipos.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar tipos de procedimiento');
        this.loading.set(false);
      }
    });
  }

  cargarCategorias(): void {
    this.api.getCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => this.categorias.set(res),
      error: () => {}
    });
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.idOriginal.set(null);
    this.formCategoriaId.set(null);
    this.formProcedimiento.set('');
    this.formCodigo.set('');
    this.error.set(null);
    this.cargarCategorias();
    this.mostrarFormulario.set(true);
  }

  abrirEditar(t: TipoProcedimiento): void {
    this.editando.set(true);
    this.idOriginal.set(t.tipo_procedimiento_id);
    this.formCategoriaId.set(t.categoria_procedimiento_id);
    const parteProcedimiento = t.nombre.includes(' - ')
      ? t.nombre.split(' - ').slice(1).join(' - ')
      : t.nombre;
    this.formProcedimiento.set(parteProcedimiento);
    this.formCodigo.set(t.codigo);
    this.error.set(null);
    this.cargarCategorias();
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  onCategoriaChange(): void {
    this.error.set(null);
  }

  guardar(): void {
    const categoriaId = this.formCategoriaId();
    const procedimiento = this.formProcedimiento().trim();

    if (!categoriaId) {
      this.error.set('Debe seleccionar una especialidad (categoría)');
      return;
    }
    if (!procedimiento) {
      this.error.set('El procedimiento es requerido');
      return;
    }

    const categoria = this.categorias().find(c => c.categoria_procedimiento_id === categoriaId);
    const nombre = `${categoria?.nombre ?? 'Especialidad'} - ${procedimiento}`;

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: any = {
      nombre,
      categoria_procedimiento_id: categoriaId,
      codigo: this.formCodigo().trim() || undefined,
      activo: true
    };

    const obs = this.editando() && this.idOriginal()
      ? this.api.actualizarTipoProcedimiento(this.idOriginal()!, payload)
      : this.api.crearTipoProcedimiento(payload);

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

    this.api.eliminarTipoProcedimiento(id).pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set('Procedimiento eliminado');
        this.confirmarEliminar.set(null);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al eliminar el procedimiento');
        this.confirmarEliminar.set(null);
      }
    });
  }

  // ── Import CSV ──
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.resultadoImport.set(null);
    this.importando.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.importarTiposCsv(file).pipe(finalize(() => this.importando.set(false)), takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.resultadoImport.set(res);
        this.success.set(`Importación completada: ${res.creados} creados, ${res.omitidos} omitidos`);
        if (input) input.value = '';
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al importar el CSV');
        if (input) input.value = '';
      }
    });
  }

  confirmarTruncar = false;

  truncar(): void {
    if (!this.confirmarTruncar) { this.confirmarTruncar = true; return; }
    if (!confirm('¿Eliminar TODOS los tipos y categorías de procedimiento?\n\nEsta acción es irreversible.')) {
      this.confirmarTruncar = false;
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.truncarTipos().pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.confirmarTruncar = false;
        this.success.set('Tabla de tipos de procedimiento vaciada');
        this.cargar();
      },
      error: (err: any) => {
        this.confirmarTruncar = false;
        this.error.set(err.error?.detail || 'Error al vaciar la tabla');
      }
    });
  }

  nombreCategoria(id: number): string {
    return this.categorias().find(c => c.categoria_procedimiento_id === id)?.nombre ?? '—';
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}