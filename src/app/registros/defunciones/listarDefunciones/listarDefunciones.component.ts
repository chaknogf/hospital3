import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DefuncionesService } from '../defunciones.service';
import { Defuncion } from '../defunciones.interface';
import { ApiService } from '../../../service/api.service';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';

@Component({
  selector: 'app-listarDefunciones',
  templateUrl: './listarDefunciones.component.html',
  styleUrls: ['./listarDefunciones.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CapitalizePipe]
})
export class ListarDefuncionesComponent implements OnInit, OnDestroy {
  datos: Defuncion[] = [];
  cargando = false;
  filtrar = false;
  pageSize = 10;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    q: '',
    expediente: '',
    paciente_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    es_fetal: '',
    estado: 'A',
    limit: this.pageSize,
    skip: 0
  };

  constructor(
    private api: DefuncionesService,
    private apis: ApiService,
    private router: Router
  ) {}

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.api.defunciones$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.datos = data;
      this.cdr.markForCheck();
    });
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.cargarDatos());
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos() {
    this.cargando = true;
    const f = { ...this.filtros };
    if (!f.es_fetal) delete f.es_fetal;
    this.api.listarDefunciones(f).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.totalDeRegistros = r.total;
        this.datos = r.defunciones;
        this.cargando = false;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleFiltrar() { this.filtrar = !this.filtrar; }

  limpiarFiltros() {
    this.filtros = { q: '', expediente: '', paciente_id: '', fecha_desde: '', fecha_hasta: '', es_fetal: '', estado: 'A', limit: this.pageSize, skip: 0 };
    this.cargarDatos();
  }

  editar(id: number) { this.router.navigate(['/cons-def', id]); }
  imprimir(id: number) { this.router.navigate(['/cdprint', id]); }
  volver() { this.router.navigate(['/registros']); }
  agregar() { this.router.navigate(['/nueva-cons-def']); }

  get totalPaginas(): number { return Math.ceil(this.totalDeRegistros / this.pageSize) || 1; }
  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.cargarDatos();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.cargarDatos();
  }

  trackById(index: number, item: any): any { return item?.id ?? index; }

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
}
