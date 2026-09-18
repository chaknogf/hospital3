import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { catchError, finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { QuirofanoService } from '../../../medica/quirofano/quirofano.service';
import { ProcedimientoQuirofano, Especialidad } from '../../../interface/quirofano.interface';

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

  procedimientosQuirofano = signal<ProcedimientoQuirofano[]>([]);
  especialidades = signal<Especialidad[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtro = signal<string>('');
  especialidadFiltro = signal<number | null>(null);

  mostrarFormulario = signal(false);
  editando = signal<boolean>(false);
  guardando = signal(false);

  readonly MIXTA_VAL = -1;
  formEspecialidadId = signal<number | null>(null);
  formProcedimiento = signal('');
  formCodigo = signal('');

  idOriginal = signal<number | null>(null);

  confirmarEliminar = signal<number | null>(null);

  // Import CSV
  importando = signal(false);
  resultadoImport = signal<{ creados: number; omitidos: number; errores: any[] } | null>(null);

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

    const params: any = { activos: true, limit: 5000 };
    const q = this.filtro();
    const esp = this.especialidadFiltro();
    if (q) params.q = q;
    if (esp) params.especialidad_id = esp;

    this.api.getProcedimientosQuirofano(esp ?? undefined, q || undefined).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.procedimientosQuirofano.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar procedimientos de quirófano');
        this.loading.set(false);
      }
    });
  }

  cargarEspecialidades(): void {
    this.api.getEspecialidades().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => this.especialidades.set(res),
      error: () => {}
    });
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.idOriginal.set(null);
    this.formEspecialidadId.set(null);
    this.formProcedimiento.set('');
    this.formCodigo.set('');
    this.error.set(null);
    this.cargarEspecialidades();
    this.mostrarFormulario.set(true);
  }

  abrirEditar(t: ProcedimientoQuirofano): void {
    this.editando.set(true);
    this.idOriginal.set(t.procedimiento_quirofano_id);
    this.formEspecialidadId.set(t.especialidad_id == null ? this.MIXTA_VAL : t.especialidad_id);
    this.formProcedimiento.set(t.nombre);
    this.formCodigo.set(t.codigo);
    this.error.set(null);
    this.cargarEspecialidades();
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  onEspecialidadChange(): void {
    this.error.set(null);
  }

  guardar(): void {
    const especialidadId = this.formEspecialidadId();
    const procedimiento = this.formProcedimiento().trim();

    if (especialidadId === null || especialidadId === undefined) {
      this.error.set('Debe seleccionar una especialidad');
      return;
    }
    if (!procedimiento) {
      this.error.set('El procedimiento es requerido');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: any = {
      nombre: procedimiento,
      especialidad_id: especialidadId === this.MIXTA_VAL ? null : especialidadId,
      codigo: this.formCodigo().trim() || undefined,
      activo: true
    };

    const obs = this.editando() && this.idOriginal()
      ? this.api.actualizarProcedimientoQuirofano(this.idOriginal()!, payload)
      : this.api.crearProcedimientoQuirofano(payload);

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

    this.api.eliminarProcedimientoQuirofano(id).pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
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

    this.api.importarProcedimientosCsv(file).pipe(finalize(() => this.importando.set(false)), takeUntil(this.destroy$)).subscribe({
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
    if (!confirm('¿Eliminar TODOS los procedimientos de quirófano?\n\nEsta acción es irreversible.')) {
      this.confirmarTruncar = false;
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.truncarProcedimientos().pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.confirmarTruncar = false;
        this.success.set('Tabla de procedimientos de quirófano vaciada');
        this.cargar();
      },
      error: (err: any) => {
        this.confirmarTruncar = false;
        this.error.set(err.error?.detail || 'Error al vaciar la tabla');
      }
    });
  }

  nombreEspecialidad(id: number | null): string {
    if (id == null) return 'Todas (mixta)';
    return this.especialidades().find(c => c.id === id)?.nombre ?? '—';
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}