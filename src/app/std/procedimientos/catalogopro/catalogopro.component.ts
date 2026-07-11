import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Procedimiento,
  ProcedimientoCreate
} from '../../../interface/procedimientos';

import { StdService } from '../../std.service';
import { IconService } from '../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-catalogopro',
  templateUrl: './catalogopro.component.html',
  styleUrls: ['./catalogopro.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule
]
})
export class CatalogoproComponent implements OnInit, OnDestroy {

  private location = inject(Location);
  private api = inject(StdService);
  private router = inject(Router);
  private iconService = inject(IconService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

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
    this.api.catalogo$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.catalogoCompleto = data;
      this.actualizarPagina();
      this.cdr.markForCheck();
    });

    this.cargarCatalogo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private actualizarPagina(): void {
    this.totalDeRegistros = this.catalogoCompleto.length;
    const inicio = (this.paginaActual - 1) * this.pageSize;
    const fin = inicio + this.pageSize;
    this.procedimientos = this.catalogoCompleto.slice(inicio, fin);
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.api.getCatalogo().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.totalDeRegistros = data.length;
        const inicio =
          (this.paginaActual - 1) * this.pageSize;
        const fin =
          inicio + this.pageSize;
        this.procedimientos =
          data.slice(inicio, fin);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.procedimientos = [];
        this.totalDeRegistros = 0;
        this.cdr.markForCheck();
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
      this.api.getProcedimientoCatalogo(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: data => { this.form.patchValue(data); this.cdr.markForCheck(); },
        error: err => { console.error(err); this.cdr.markForCheck(); },
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
      this.api.updateProcedimiento(this.procedimientoId, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.cerrarModal();
          this.cdr.markForCheck();
        },
        error: err => {
          console.error(err);
          this.guardando = false;
          this.cdr.markForCheck();
        },
        complete: () => { this.guardando = false; }
      });
    } else {
      this.paginaActual = 1;
      this.api.createProcedimiento(payload as ProcedimientoCreate).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.cerrarModal();
          this.cdr.markForCheck();
        },
        error: err => {
          console.error(err);
          this.guardando = false;
          this.cdr.markForCheck();
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

    this.api.deleteProcedimiento(id).pipe(takeUntil(this.destroy$)).subscribe({

      next: () => {
        // catálogo se actualiza via catalogo$
        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      }

    });
  }

  trackById(index: number, item: any): any {
    return item.id ?? index;
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
    this.actualizarPagina();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = pagina;
    this.actualizarPagina();
  }


}
