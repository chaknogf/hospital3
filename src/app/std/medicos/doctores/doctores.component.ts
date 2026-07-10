// doctores.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoOut } from '../../../interface/medicos.interface';
import { MedicosService } from '../medicos.service';
import { IconService } from '../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-doctores',
  templateUrl: './doctores.component.html',
  styleUrls: ['./doctores.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class DoctoresComponent implements OnInit, OnDestroy {

  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ======= DATA =======

  medicos: MedicoOut[] = [];
  cargando = false;

  // ======= UI =======

  filtrar = false;
  visible = false;
  modalActivo = false;

  rowActiva: number | null = null;

  // ======= PAGINACIÓN =======

  pageSize: number = 20;
  paginaActual: number = 1;
  totalDeRegistros = 0;

  // ======= FILTROS =======

  filtros: any = {
    id: '',
    nombre: '',
    colegiado: '',
    especialidad: '',
    activo: '',
    limit: this.pageSize
  };

  // ======= ICONOS =======

  icons: { [key: string]: any } = {};

  constructor(
    private api: MedicosService,
    private router: Router,
    private iconService: IconService
  ) {

    this.icons = {
      search: this.iconService.getIcon("searchIcon"),
      delete: this.iconService.getIcon("deletInput"),
      create: this.iconService.getIcon("createIcon"),
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      tabla: this.iconService.getIcon("tablaShanonIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuIcon"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      activo: this.iconService.getIcon("activoIcon"),
    };
  }

  ngOnInit(): void {

    this.api.medicos$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.medicos = data;
      this.cdr.markForCheck();
    });

    this.cargarMedicos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= API =======

  cargarMedicos(): void {

    this.cargando = true;

    this.api.getMedicos(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({

      next: (resultado) => {

        this.medicos = resultado;
        this.totalDeRegistros = resultado.length;
        this.cdr.markForCheck();
      },

      error: (err) => {

        console.error('Error cargando médicos:', err);

        this.medicos = [];
        this.totalDeRegistros = 0;
        this.cdr.markForCheck();
      },

      complete: () => {
        this.cargando = false;
      }

    });
  }

  buscar(): void {
    this.cargarMedicos();
  }

  // ======= UI =======

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  limpiarFiltros(): void {

    this.filtros = {
      id: '',
      nombre: '',
      colegiado: '',
      especialidad: '',
      activo: '',
      limit: this.pageSize
    };

    this.cargarMedicos();
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  mostrar(): void {
    this.visible = !this.visible;
  }

  volver(): void {
    this.location.back();
  }

  // ======= CRUD =======

  agregar(): void {
    this.router.navigate(['/doctor']);
  }


  editar(id: number): void {
    this.router.navigate(['/doctor', id]);
  }


  verDetalle(id: number): void {
    this.router.navigate(['/medicos/detalle', id]);
  }

  eliminar(id: number): void {

    const confirmar = confirm('¿Desea eliminar este médico?');

    if (!confirmar) return;

    this.api.eliminarMedico(id).pipe(takeUntil(this.destroy$)).subscribe({

      next: () => {
        this.cargarMedicos();
        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      }

    });
  }

  cambiarEstado(data: MedicoOut): void {

    this.api
      .cambiarEstado(data.id, !data.activo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: () => {
          this.cargarMedicos();
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

  // ======= EXCEL =======

  async descargarExcel(): Promise<void> {
    this.api.getAllMedicos().pipe(takeUntil(this.destroy$)).subscribe({
      next: async data => {
        if (!data.length) {
          alert('No hay registros para exportar.');
          return;
        }

        const rows = data.map(m => ({
          ID: m.id,
          Nombre: m.nombre,
          Colegiado: m.colegiado || '',
          Especialidad: m.especialidad || '',
          Estado: m.activo ? 'Activo' : 'Inactivo',
          DPI: m.dpi || '',
          Sexo: m.sexo || ''
        }));

        const { default: ExcelJS } = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Médicos');
        ws.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k, width: Math.max(k.length, 18) }));
        ws.addRows(rows);
        await wb.xlsx.writeFile(`medicos_${new Date().toISOString().slice(0, 10)}.xlsx`);
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Error al descargar Excel:', err);
        alert('Error al descargar el Excel. Intente de nuevo.');
        this.cdr.markForCheck();
      }
    });
  }

  // ======= PAGINADOR =======

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

    if (nueva < 1 || nueva > this.totalPaginas) return;

    this.paginaActual = nueva;

    this.cargarMedicos();
  }

  irAPagina(pagina: number): void {

    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaActual = pagina;

    this.cargarMedicos();
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
