import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PacienteResumen } from '../../../interface/interfaces';
import { PacienteService } from '../paciente.service';
import { EdadPipe } from '../../../pipes/edad.pipe';
import { HighlightPipe } from '../../../pipes/highlight.pipe';

type Modo = 'recientes' | 'mayores-1anio';

@Component({
  selector: 'app-expedientes',
  templateUrl: './expedientes.component.html',
  styleUrls: ['./expedientes.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, EdadPipe, HighlightPipe],
})
export class ExpedientesComponent implements OnInit, OnDestroy {
  private api = inject(PacienteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  pacientes: PacienteResumen[] = [];
  cargando = false;
  modo: Modo = 'recientes';

  readonly pageSize = 14;
  paginaActual = 1;
  totalDeRegistros = 0;

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean {
    return this.paginaActual > 1;
  }

  get hayPaginaSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  filtros: { q: string; skip: number; limit: number; expediente_desde?: string; expediente_hasta?: string } = {
    q: '',
    skip: 0,
    limit: this.pageSize,
  };

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  seleccionarModo(modo: Modo): void {
    if (this.modo === modo) return;
    this.modo = modo;
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.filtros.q = '';
    this.cargar();
  }

  buscar(): void {
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.cargar();
  }

  limpiarBusqueda(): void {
    this.filtros.q = '';
    this.filtros.expediente_desde = undefined;
    this.filtros.expediente_hasta = undefined;
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.cargar();
  }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.cargar();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.cargar();
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2;
    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

  private cargar(): void {
    this.cargando = true;
    const filtros = { ...this.filtros };

    const obs$ =
      this.modo === 'recientes'
        ? this.api.getPacientesConConsultasRecientes(filtros)
        : this.api.getPacientesSinConsultasRecientes(filtros);

    obs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.pacientes = res.pacientes;
        this.totalDeRegistros = res.total;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.pacientes = [];
        this.totalDeRegistros = 0;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  volver(): void {
    this.router.navigate(['/registros']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/detallePaciente', id]);
  }

  nombreCompleto(p: PacienteResumen): string {
    if (!p?.nombre) return '';
    const n = p.nombre;
    const cap = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const nombres = [n.primer_nombre, n.segundo_nombre, n.otro_nombre].filter((s): s is string => !!s).map(cap).join(' ');
    let apellidos = [n.primer_apellido, n.segundo_apellido].filter((s): s is string => !!s).map(cap).join(' ');
    if (n.apellido_casada) {
      apellidos += ' de ' + cap(n.apellido_casada);
    }
    return nombres + ' ' + apellidos;
  }

  trackById(_index: number, item: PacienteResumen): number {
    return item.id;
  }
}
