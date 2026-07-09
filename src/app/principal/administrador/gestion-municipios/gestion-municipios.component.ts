import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Municipio, DepartamentoOut } from '../../../interface/interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-municipios',
  templateUrl: './gestion-municipios.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class GestionMunicipiosComponent implements OnDestroy {
  private router = inject(Router);
  private api = inject(ApiService);

  private destroy$ = new Subject<void>();

  municipios = signal<Municipio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtro = signal<string>('');
  departamentoFiltro = signal<string>('');

  mostrarFormulario = signal(false);
  editando = signal<boolean>(false);
  guardando = signal(false);

  formCodigo = signal('');
  formMunicipio = signal('');
  formDepartamento = signal('');
  formVecindad = signal('');

  codigoOriginal = signal<string | null>(null);

  confirmarEliminar = signal<string | null>(null);

  departamentos = signal<string[]>([]);

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
    const filtros: any = { limit: 500 };
    const q = this.filtro();
    const dep = this.departamentoFiltro();
    if (q) filtros.q = q;
    if (dep) filtros.departamento = dep;

    this.api.getMunicipios(filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.municipios.set(res.municipios || []);
        this.loading.set(false);
        this.extraerDepartamentos(res.municipios || []);
      },
      error: () => {
        this.error.set('Error al cargar municipios');
        this.loading.set(false);
      }
    });
  }

  private extraerDepartamentos(lista: Municipio[]): void {
    const deps = [...new Set(lista.map(m => m.departamento).filter(Boolean))].sort();
    this.departamentos.set(deps);
  }

  abrirNuevo(): void {
    this.editando.set(false);
    this.codigoOriginal.set(null);
    this.formCodigo.set('');
    this.formMunicipio.set('');
    this.formDepartamento.set('');
    this.formVecindad.set('');
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(m: Municipio): void {
    this.editando.set(true);
    this.codigoOriginal.set(m.codigo);
    this.formCodigo.set(m.codigo);
    this.formMunicipio.set(m.municipio);
    this.formDepartamento.set(m.departamento);
    this.formVecindad.set(m.vecindad || '');
    this.error.set(null);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.error.set(null);
  }

  guardar(): void {
    const codigo = this.formCodigo().trim();
    const municipio = this.formMunicipio().trim();
    const departamento = this.formDepartamento().trim();

    if (!codigo || !municipio || !departamento) {
      this.error.set('Código, municipio y departamento son requeridos');
      return;
    }
    if (!/^\d{4}$/.test(codigo)) {
      this.error.set('El código debe tener 4 dígitos (ej: 0101)');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: Municipio = {
      codigo,
      municipio,
      departamento,
      vecindad: this.formVecindad().trim() || ''
    };

    const obs = this.editando()
      ? this.api.updateMunicipio(this.codigoOriginal()!, payload)
      : this.api.createMunicipio(payload);

    obs.pipe(finalize(() => this.guardando.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set(this.editando() ? 'Municipio actualizado' : 'Municipio creado');
        this.mostrarFormulario.set(false);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al guardar municipio');
      }
    });
  }

  confirmarEliminacion(codigo: string): void {
    this.confirmarEliminar.set(codigo);
  }

  cancelarEliminacion(): void {
    this.confirmarEliminar.set(null);
  }

  eliminar(codigo: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.deleteMunicipio(codigo).pipe(finalize(() => this.loading.set(false)), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set('Municipio eliminado');
        this.confirmarEliminar.set(null);
        this.cargar();
      },
      error: (err: any) => {
        this.error.set(err.error?.detail || 'Error al eliminar municipio');
        this.confirmarEliminar.set(null);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
