import { Dict, especialidadesProcedimientos, lugarServicios } from './../../../enum/diccionarios';
import { IconService } from './../../../service/icon.service';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';;
import { ProceMedico } from '../../../interface/procedimientos';
import { StdService } from '../../std.service';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';

@Component({
  selector: 'app-procedimientosmenores',
  templateUrl: './procedimientosmenores.component.html',
  styleUrls: ['./procedimientosmenores.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatosExtraPipe
  ]
})
export class ProcedimientosmenoresComponent implements OnInit {

  private location = inject(Location);
  private api = inject(StdService);
  private router = inject(Router);
  private iconService = inject(IconService);

  procedimientos: ProceMedico[] = [];
  especialidadesfiltradas: Dict[] = especialidadesProcedimientos;
  lugarServicios: Dict[] = lugarServicios;
  cargando = false;
  filtrar = false;
  modalActivo = false;
  rowActiva: number | null = null;
  pageSize = 20;
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
    this.api.getProcedimientos(this.filtros).subscribe({
      next: resultado => {
        this.procedimientos = resultado.procedimientos;
        this.totalDeRegistros = resultado.total;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: err => {
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
    this.filtros.skip = 0;
    this.cargarProcedimientos();
  }

  limpiarFiltros(): void {
    this.paginaActual = 1;
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      especialidad: '',
      lugar_servicio: '',
      id_procedimiento: '',
      fecha_inicio: '',
      fecha_fin: ''
    };
    this.cargarProcedimientos();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  volver(): void {
    this.router.navigate(['/estadistica'])
  }

  agregar(): void {
    this.router.navigate(['/procemedic']);
  }

  editar(id: number): void {
    this.router.navigate(['/procemedicEdit', id]);
  }

  catalogo(): void {
    this.router.navigate(['/catalogoProcedimientos']);
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

    for (
      let i = Math.max(1, actual - delta);
      i <= Math.min(total, actual + delta);
      i++
    ) {
      rango.push(i);
    }

    return rango;
  }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) {
      return;
    }
    this.paginaActual = nueva;
    this.filtros.skip =
      (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarProcedimientos();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = pagina;
    this.filtros.skip =
      (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarProcedimientos();
  }


}
