import { Component, OnDestroy, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EspecialidadesService } from '../../../service/especialidades.service';
import { Especialidad } from '../../../interface/quirofano.interface';

@Component({
  selector: 'app-gestion-especialidades',
  templateUrl: './gestion-especialidades.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
/** Mantiene el catálogo de especialidades utilizado en consultas y reportes. */
export class GestionEspecialidadesComponent implements OnDestroy {
  private router = inject(Router);
  private api = inject(EspecialidadesService);

  private destroy$ = new Subject<void>();

  especialidades = signal<Especialidad[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtro = signal<string>('');
  filtroEstado = signal<'todas' | 'activas' | 'inactivas' | 'sop'>('todas');

  filtradas = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    const f = this.filtroEstado();
    return this.especialidades().filter(e => {
      if (q && !e.nombre.toLowerCase().includes(q)) return false;
      if (f === 'activas') return e.estado;
      if (f === 'inactivas') return !e.estado;
      if (f === 'sop') return e.estado && e.sop;
      return true;
    });
  });

  mostrarFormulario = signal(false);
  editando = signal(false);
  guardando = signal(false);

  formNombre = signal('');
  formAbreviatura = signal('');
  formCodigo = signal('');
  formEstado = signal(true);
  formSop = signal(true);

  idOriginal = signal<number | null>(null);
  confirmarEliminar = signal<number | null>(null);

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

    this.api.getEspecialidades().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.especialidades.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar especialidades');
        this.loading.set(false);
      }
    });
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.idOriginal.set(null);
    this.formNombre.set('');
    this.formAbreviatura.set('');
    this.formCodigo.set('');
    this.formEstado.set(true);
    this.formSop.set(true);
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(e: Especialidad): void {
    this.editando.set(true);
    this.idOriginal.set(e.id);
    this.formNombre.set(e.nombre);
    this.formAbreviatura.set(e.abreviatura || '');
    this.formCodigo.set(e.codigo || '');
    this.formEstado.set(e.estado);
    this.formSop.set(e.sop);
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  guardar(): void {
    const nombre = this.formNombre().trim();
    if (!nombre) {
      this.error.set('El nombre es requerido');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: any = {
      nombre,
      abreviatura: this.formAbreviatura().trim() || null,
      codigo: this.formCodigo().trim() || null,
      estado: this.formEstado(),
      sop: this.formSop()
    };

    const obs = this.editando() && this.idOriginal()
      ? this.api.actualizarEspecialidad(this.idOriginal()!, payload)
      : this.api.crearEspecialidad(payload);

    obs.pipe(finalize(() => this.guardando.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set(this.editando() ? 'Especialidad actualizada' : 'Especialidad creada');
        this.mostrarFormulario.set(false);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al guardar la especialidad');
      }
    });
  }

  toggleEstado(e: Especialidad): void {
    this.error.set(null);
    this.success.set(null);
    this.api.actualizarEspecialidad(e.id, { estado: !e.estado } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set(`Especialidad ${!e.estado ? 'activada' : 'desactivada'}`);
          this.cargar();
        },
        error: (err: any) => this.error.set(err.error?.detail || 'Error al cambiar el estado')
      });
  }

  toggleSop(e: Especialidad): void {
    this.error.set(null);
    this.success.set(null);
    this.api.actualizarEspecialidad(e.id, { sop: !e.sop } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set(`SOP ${!e.sop ? 'habilitado' : 'deshabilitado'}`);
          this.cargar();
        },
        error: (err: any) => this.error.set(err.error?.detail || 'Error al cambiar SOP')
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

    this.api.eliminarEspecialidad(id).pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set('Especialidad eliminada');
        this.confirmarEliminar.set(null);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al eliminar la especialidad');
        this.confirmarEliminar.set(null);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
