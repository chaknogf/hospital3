import { Dict, lugarServicios } from './../../../enum/diccionarios';
import { IconService } from './../../../service/icon.service';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';;
import { CategoriaEdadItem, ProceMedico } from '../../../interface/procedimientos';
import { Especialidad } from '../../../interface/quirofano.interface';
import { EspecialidadesService } from '../../../service/especialidades.service';
import { StdService } from '../../std.service';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';

@Component({
  selector: 'app-procedimientosmenores',
  templateUrl: './procedimientosmenores.component.html',
  styleUrls: ['./procedimientosmenores.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    DatosExtraPipe
  ]
})
/** Registra y consulta procedimientos menores realizados en el hospital. */
export class ProcedimientosmenoresComponent implements OnInit {

  private location = inject(Location);
  private api = inject(StdService);
  private especialidadesApi = inject(EspecialidadesService);
  private router = inject(Router);
  private iconService = inject(IconService);

  procedimientos: ProceMedico[] = [];
  especialidades: Especialidad[] = [];
  lugarServicios: Dict[] = lugarServicios;
  gruposEdad: CategoriaEdadItem[] = [];
  cargando = false;
  filtrar = false;
  modalActivo = false;
  rowActiva: number | null = null;
  pageSize = 10;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    especialidad_id: null,
    lugar_servicio: '',
    categoria: '',
    sexo: '',
    fecha_inicio: '',
    fecha_fin: '',
    skip: 0,
    limit: this.pageSize
  };

  /** Etiqueta legible de una categoría etaria (o de los históricos sin edad). */
  nombreCategoria(codigo: string): string {
    return this.gruposEdad.find(g => g.codigo === codigo)?.nombre
      ?? (codigo === 'sin_edad' ? 'Sin edad (histórico)' : codigo);
  }

  /** Categorías (niño/adulto) con cantidad de un registro, con su etiqueta. */
  detalleEdad(data: ProceMedico): { codigo: string; nombre: string; m: number; f: number }[] {
    const items = [
      { codigo: 'nino', nombre: this.nombreCategoria('nino'), m: data.nino_m || 0, f: data.nino_f || 0 },
      { codigo: 'adulto', nombre: this.nombreCategoria('adulto'), m: data.adulto_m || 0, f: data.adulto_f || 0 },
      { codigo: 'sin_edad', nombre: this.nombreCategoria('sin_edad'), m: data.sin_edad_m || 0, f: data.sin_edad_f || 0 }
    ];
    return items.filter(i => i.m > 0 || i.f > 0);
  }

  icons: { [key: string]: any } = {};

  constructor(

  ) {

    this.icons = {
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      create: this.iconService.getIcon('createIcon'),
      edit: this.iconService.getIcon('editIcon'),
      print: this.iconService.getIcon('printIcon'),
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

    this.api.getGruposEdad().subscribe({
      next: d => this.gruposEdad = d,
      error: err => console.error(err)
    });

    // Mismas especialidades que ofrece la captura (procemedico) para que el
    // filtro coincida con el especialidad_id con el que se guardan los registros.
    this.especialidadesApi.getEspecialidades(true, true).subscribe({
      next: d => this.especialidades = d,
      error: err => console.error(err)
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
    // El backend filtra por rango; con una sola fecha se consulta ese día.
    this.filtros.fecha_fin = this.filtros.fecha_inicio;
    this.cargarProcedimientos();
  }

  limpiarFiltros(): void {
    this.paginaActual = 1;
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      especialidad_id: null,
      lugar_servicio: '',
      categoria: '',
      sexo: '',
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
    this.router.navigate(['/estadistica/consultar'])
  }

  agregar(): void {
    this.router.navigate(['/procemedic']);
  }

  irACaptura(): void {
    this.router.navigate(['/reportes/captura-procedimientos']);
  }

  editar(id: number): void {
    this.router.navigate(['/procemedicEdit', id]);
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este procedimiento registrado?')) return;
    this.cargando = true;
    this.api.deleteProcedimientoMedico(id).subscribe({
      next: () => this.cargarProcedimientos(),
      error: err => { this.cargando = false; console.error(err); }
    });
  }

  catalogo(): void {
    this.router.navigate(['/gestion-procedimientos']);
  }

  trackById(index: number, item: any): any {
    return item.id ?? index;
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
