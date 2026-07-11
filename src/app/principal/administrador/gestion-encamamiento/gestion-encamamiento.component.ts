import { Component, OnDestroy, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Encamamiento } from '../../../interface/interfaces';
import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-encamamiento',
  templateUrl: './gestion-encamamiento.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class GestionEncamamientoComponent implements OnDestroy {
  private router = inject(Router);
  private api = inject(ApiService);

  private destroy$ = new Subject<void>();

  servicios = signal<Encamamiento[]>([]);
  totalCamas = computed(() => this.servicios().reduce((sum, s) => sum + (s.camas_censables || 0), 0));
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtroActivo = signal<string>('todos');

  mostrarFormulario = signal(false);
  editando = signal<boolean>(false);
  guardando = signal(false);

  formId = signal<number | null>(null);
  formNombre = signal('');
  formDescripcion = signal('');
  formCamas = signal<number>(0);
  formActivo = signal<boolean>(true);

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

    const activo = this.filtroActivo() === 'todos' ? null : this.filtroActivo() === 'activos';

    this.api.getServiciosEncamamiento(activo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: Encamamiento[]) => {
        this.servicios.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar servicios');
        this.loading.set(false);
      }
    });
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.formId.set(null);
    this.formNombre.set('');
    this.formDescripcion.set('');
    this.formCamas.set(0);
    this.formActivo.set(true);
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(s: Encamamiento): void {
    this.editando.set(true);
    this.formId.set(s.id);
    this.formNombre.set(s.nombre_servicio);
    this.formDescripcion.set(s.descripcion || '');
    this.formCamas.set(s.camas_censables);
    this.formActivo.set(s.activo);
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
      this.error.set('El nombre del servicio es requerido');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload = {
      nombre_servicio: nombre,
      descripcion: this.formDescripcion().trim() || null,
      camas_censables: this.formCamas(),
      activo: this.formActivo()
    };

    const obs = this.editando()
      ? this.api.updateServicioEncamamiento(this.formId()!, payload)
      : this.api.createServicioEncamamiento(payload);

    obs.pipe(finalize(() => this.guardando.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set(this.editando() ? 'Servicio actualizado' : 'Servicio creado');
        this.mostrarFormulario.set(false);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al guardar servicio');
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

    this.api.deleteServicioEncamamiento(id).pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set('Servicio eliminado');
        this.confirmarEliminar.set(null);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al eliminar servicio');
        this.confirmarEliminar.set(null);
      }
    });
  }

  onCamasChange(val: string): void {
    this.formCamas.set(val ? parseInt(val, 10) : 0);
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
