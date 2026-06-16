import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Procedimiento,
  ProcedimientoCreate
} from '../../../interface/procedimientos';

import { StdService } from '../../std.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-catalogopro',
  templateUrl: './catalogopro.component.html',
  styleUrls: ['./catalogopro.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CatalogoproComponent implements OnInit {

  private location = inject(Location);
  private api = inject(StdService);
  private router = inject(Router);
  private iconService = inject(IconService);
  private fb = inject(FormBuilder);

  procedimientos: Procedimiento[] = [];
  catalogoCompleto: Procedimiento[] = [];

  cargando = false;
  filtrar = false;
  modalActivo = false;
  modoEdicion = false;
  procedimientoId: number | null = null;
  guardando = false;

  rowActiva: number | null = null;

  pageSize = 5;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    nombre: '',
    abreviatura: ''
  };

  icons: { [key: string]: any } = {};
  saveIcon: any;
  cancelIcon: any;

  form: FormGroup = this.fb.group({
    abreviatura: [''],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    anestesia: [0, [Validators.min(0)]]
  });

  constructor() {

    this.icons = {
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      create: this.iconService.getIcon('createIcon'),
      edit: this.iconService.getIcon('editIcon'),
      trash: this.iconService.getIcon('trashIcon'),
      find: this.iconService.getIcon('findIcon'),
      menu: this.iconService.getIcon('menuIcon'),
      arrowDown: this.iconService.getIcon('arrowDown'),
      skipLeft: this.iconService.getIcon('skipLeft'),
      skipRight: this.iconService.getIcon('skipRight')
    };
    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  ngOnInit(): void {
    this.api.catalogo$.subscribe(data => {
      this.catalogoCompleto = data;

    });

    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.api.getCatalogo().subscribe({
      next: (data) => {
        this.totalDeRegistros = data.length;
        const inicio =
          (this.paginaActual - 1) * this.pageSize;
        const fin =
          inicio + this.pageSize;
        this.procedimientos =
          data.slice(inicio, fin);
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

  }

  limpiarFiltros(): void {
    this.paginaActual = 1;
    this.filtros = {
      nombre: '',
      abreviatura: ''
    };

    this.cargarCatalogo();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  volver(): void {
    this.router.navigate(['/procedimientosmenores']);
  }

  agregar(): void {
    this.modoEdicion = false;
    this.procedimientoId = null;
    this.form.reset({ anestesia: 0 });
    this.modalActivo = true;
  }

  editar(id: number): void {
    this.modoEdicion = true;
    this.procedimientoId = id;
    this.modalActivo = true;
    this.cargando = true;

    const existente = this.catalogoCompleto.find(p => p.id === id);
    if (existente) {
      this.form.patchValue(existente);
      this.cargando = false;
    } else {
      this.api.getProcedimientoCatalogo(id).subscribe({
        next: data => this.form.patchValue(data),
        error: err => console.error(err),
        complete: () => { this.cargando = false; }
      });
    }
  }

  cerrarModal(): void {
    this.modalActivo = false;
    this.modoEdicion = false;
    this.procedimientoId = null;
    this.form.reset({ anestesia: 0 });
    this.guardando = false;
  }

  guardarProcedimiento(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const payload = { ...this.form.value };

    if (this.modoEdicion && this.procedimientoId) {
      this.api.updateProcedimiento(this.procedimientoId, payload).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCatalogo();
        },
        error: err => {
          console.error(err);
          this.guardando = false;
        },
        complete: () => { this.guardando = false; }
      });
    } else {
      this.api.createProcedimiento(payload as ProcedimientoCreate).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCatalogo();
        },
        error: err => {
          console.error(err);
          this.guardando = false;
        },
        complete: () => { this.guardando = false; }
      });
    }
  }

  eliminar(id: number): void {

    const confirmar =
      confirm('¿Desea eliminar este procedimiento?');

    if (!confirmar) {
      return;
    }

    this.api.deleteProcedimiento(id).subscribe({

      next: () => {
        this.cargarCatalogo();
      },

      error: (err) => {
        console.error(err);
      }

    });
  }

  get f() { return this.form.controls; }

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
    this.cargarCatalogo();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = pagina;
    this.cargarCatalogo();
  }


}
