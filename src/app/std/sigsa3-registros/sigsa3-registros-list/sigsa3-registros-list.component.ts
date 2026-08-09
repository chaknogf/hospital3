// sigsa3-registros-list.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sigsa3Registro, FiltroSigsa3Registro } from '../../../interface/sigsa3-registros.interface';
import { Sigsa3RegistrosService } from '../sigsa3-registros.service';
import { MedicosService, EspecialidadItem } from '../../medicos/medicos.service';
import { IconService } from '../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sigsa3-registros-list',
  templateUrl: './sigsa3-registros-list.component.html',
  styleUrls: ['./sigsa3-registros-list.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Sigsa3RegistrosListComponent implements OnInit, OnDestroy {

  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ── Data ──
  registros: Sigsa3Registro[] = [];
  especialidades: EspecialidadItem[] = [];
  totalDeRegistros = 0;
  cargando = false;

  // ── UI ──
  filtrar = false;

  // ── Paginación ──
  pageSize = 20;
  paginaActual = 1;

  // ── Catálogos ──
  tiposConsulta = [
    { id: 1, nombre: 'Primeras' },
    { id: 2, nombre: 'Reconsultas' },
    { id: 3, nombre: 'Emergencia' },
    { id: 4, nombre: 'Interconsultas' },
  ];

  // ── Filtros ──
  filtros: FiltroSigsa3Registro = {
    q: '',
    paciente_id: undefined,
    medico_id: undefined,
    tipo_consulta_id: undefined,
    especialidad_id: undefined,
    nombre_paciente: '',
    no_historia_clinica: '',
    fecha_consulta: '',
    fecha_desde: '',
    fecha_hasta: '',
    limit: 100
  };

  // ── Iconos ──
  icons: { [key: string]: any } = {};

  constructor(
    private api: Sigsa3RegistrosService,
    private medicosApi: MedicosService,
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
    };
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargar();
  }

  cargarEspecialidades(): void {
    this.medicosApi.getEspecialidades().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => { this.especialidades = data; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── API ──

  cargar(): void {
    this.cargando = true;
    this.api.listarRegistros(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.registros = res.registros;
        this.totalDeRegistros = res.total;
        this.cdr.markForCheck();
      },
      error: () => {
        this.registros = [];
        this.totalDeRegistros = 0;
        this.cdr.markForCheck();
      },
      complete: () => { this.cargando = false; }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargar();
  }

  // ── UI ──

  toggleFiltrar(): void { this.filtrar = !this.filtrar; }

  limpiarFiltros(): void {
    this.filtros = { q: '', paciente_id: undefined, medico_id: undefined, tipo_consulta_id: undefined, especialidad_id: undefined, nombre_paciente: '', no_historia_clinica: '', fecha_consulta: '', fecha_desde: '', fecha_hasta: '', limit: 100 };
    this.cargar();
  }

  volver(): void { this.location.back(); }

  // ── CRUD ──

  nuevo(): void { this.router.navigate(['/sigsa3-registros/nuevo']); }

  editar(id: number): void { this.router.navigate(['/sigsa3-registros/editar', id]); }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este registro SIGSA-3 normalizado?')) return;
    this.api.eliminarRegistro(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.cargar(); this.cdr.markForCheck(); }
    });
  }

  // ── Paginador ──

  trackById(index: number, item: any): any {
    return item.id ?? index;
  }

  get totalPaginas(): number { return Math.ceil(this.totalDeRegistros / this.pageSize) || 1; }
  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
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

  get registrosPaginados(): Sigsa3Registro[] {
    const inicio = (this.paginaActual - 1) * this.pageSize;
    return this.registros.slice(inicio, inicio + this.pageSize);
  }
}
