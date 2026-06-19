import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NacimientoOut } from '../../../interface/nacimientos';
import { NacimientosService } from '../nacimientos.service';

@Component({
  selector: 'app-lista-nacimientos',
  templateUrl: './lista-nacimientos.component.html',
  styleUrls: ['./lista-nacimientos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ListaNacimientosComponent implements OnInit {
  private location = inject(Location);
  private api = inject(NacimientosService);
  private router = inject(Router);

  nacimientos: NacimientoOut[] = [];
  cargando = false;
  filtrar = false;
  rowActiva: number | null = null;
  pageSize = 20;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    q: '',
    expediente: '',
    sexo: '',
    fecha_desde: '',
    fecha_hasta: '',
    skip: 0,
    limit: this.pageSize
  };

  constructor() { }

  ngOnInit(): void {
    this.api.nacimientos$.subscribe(data => {
      this.nacimientos = data;
    });
    this.cargarNacimientos();
  }

  cargarNacimientos(): void {
    this.cargando = true;
    this.api.getNacimientos(this.filtros).subscribe({
      next: resultado => {
        this.nacimientos = resultado.nacimientos;
        this.totalDeRegistros = resultado.total;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: () => {
        this.nacimientos = [];
        this.totalDeRegistros = 0;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.cargarNacimientos();
  }

  limpiarFiltros(): void {
    this.paginaActual = 1;
    this.filtros = {
      q: '',
      expediente: '',
      sexo: '',
      fecha_desde: '',
      fecha_hasta: '',
      skip: 0,
      limit: this.pageSize
    };
    this.cargarNacimientos();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  volver(): void {
    this.router.navigate(['/estadistica']);
  }

  agregar(): void {
    this.router.navigate(['/nacimiento-nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/nacimiento-editar', id]);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean {
    return this.paginaActual > 1;
  }

  get hayPaginaSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
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

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarNacimientos();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarNacimientos();
  }

  sexoLabel(s: string | null | undefined): string {
    if (s === 'M') return 'Masculino';
    if (s === 'F') return 'Femenino';
    return '—';
  }
}
