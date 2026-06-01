import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';;
import { IconService } from '../../../service/icon.service';
import { ProceMedico } from '../../../interface/procedimientos';
import { StdService } from '../../std.service';

@Component({
  selector: 'app-procedimientosmenores',
  templateUrl: './procedimientosmenores.component.html',
  styleUrls: ['./procedimientosmenores.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ProcedimientosmenoresComponent implements OnInit {

  private location = inject(Location);

  procedimientos: ProceMedico[] = [];

  cargando = false;

  filtrar = false;
  modalActivo = false;

  rowActiva: number | null = null;

  pageSize = 50;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    especialidad: '',
    lugar_servicio: '',
    fecha_inicio: '',
    fecha_fin: '',
    skip: 0,
    limit: this.pageSize
  };

  icons: { [key: string]: any } = {};

  constructor(
    private api: StdService,
    private router: Router,
    private iconService: IconService
  ) {

    this.icons = {
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      create: this.iconService.getIcon('createIcon'),
      edit: this.iconService.getIcon('editIcon'),
      find: this.iconService.getIcon('findIcon'),
      menu: this.iconService.getIcon('menuIcon'),
      arrowDown: this.iconService.getIcon('arrowDown'),
      skipLeft: this.iconService.getIcon('skipLeft'),
      skipRight: this.iconService.getIcon('skipRight')
    };
  }

  ngOnInit(): void {

    this.api.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });

    this.cargarProcedimientos();
  }

  cargarProcedimientos(): void {

    this.cargando = true;

    this.filtros.skip =
      (this.paginaActual - 1) * this.pageSize;

    this.filtros.limit = this.pageSize;

    this.api.getProcedimientos(this.filtros).subscribe({

      next: (response) => {

        this.procedimientos = response.procedimientos;
        this.totalDeRegistros = response.total;
      },

      error: (err) => {

        console.error(err);

        this.procedimientos = [];
        this.totalDeRegistros = 0;
      },

      complete: () => {
        this.cargando = false;
      }

    });
  }

  buscar(): void {

    this.paginaActual = 1;

    this.cargarProcedimientos();
  }

  limpiarFiltros(): void {

    this.filtros = {
      especialidad: '',
      lugar_servicio: '',
      fecha_inicio: '',
      fecha_fin: '',
      skip: 0,
      limit: this.pageSize
    };

    this.paginaActual = 1;

    this.cargarProcedimientos();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  volver(): void {
    this.location.back();
  }

  agregar(): void {
    this.router.navigate(['/procedimiento-menor']);
  }

  editar(id: number): void {
    this.router.navigate(['/procedimiento-menor', id]);
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

  cambiarPagina(paso: number): void {

    const nueva = this.paginaActual + paso;

    if (nueva < 1 || nueva > this.totalPaginas) {
      return;
    }

    this.paginaActual = nueva;

    this.cargarProcedimientos();
  }

  get paginas(): number[] {

    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2;

    const rango: number[] = [];

    for (
      let i = Math.max(1, actual - delta);
      i <= Math.min(total, actual + delta);
      i++
    ) {
      rango.push(i);
    }

    return rango;
  }
}
