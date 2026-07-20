// sigsa3-list.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sigsa3Out, ProgresoSigsa3 } from '../../../interface/sigsa3.interface';
import { Sigsa3Service } from '../sigsa3.service';
import { IconService } from '../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sigsa3-list',
  templateUrl: './sigsa3-list.component.html',
  styleUrls: ['./sigsa3-list.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Sigsa3ListComponent implements OnInit, OnDestroy {

  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ── Data ──
  registros: Sigsa3Out[] = [];
  cargando = false;

  // ── UI ──
  filtrar = false;
  seleccionados = new Set<number>();
  modalPeriodo = false;
  modalAsociar = false;
  DesdePeriodo = '';
  HastaPeriodo = '';
  asociarExpediente = '';
  asociarHistoria = '';
  procesando = false;
  resultadoOperacion: any = null;
  progreso: ProgresoSigsa3 | null = null;

  // ── Paginación ──
  pageSize = 20;
  paginaActual = 1;
  totalDeRegistros = 0;

  // ── Filtros ──
  filtros: any = {
    q: '',
    personal_salud: '',
    nombre_paciente: '',
    tipo_consulta: '',
    especialidad: '',
    codigo_cie_10: '',
    sexo: '',
    limit: 500
  };

  // ── Iconos ──
  icons: { [key: string]: any } = {};

  constructor(
    private api: Sigsa3Service,
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
    this.api.registros$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.registros = data;
      this.cdr.markForCheck();
    });
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── API ──

  cargar(): void {
    this.cargando = true;
    this.seleccionados.clear();
    this.api.listarRegistros(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resultado) => {
        this.registros = resultado;
        this.totalDeRegistros = resultado.length;
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
    this.filtros = { q: '', personal_salud: '', nombre_paciente: '', tipo_consulta: '', especialidad: '', codigo_cie_10: '', sexo: '', limit: 500 };
    this.cargar();
  }

  activarFila(id: number, event: Event): void {
    event.stopPropagation();
    if (this.seleccionados.has(id)) {
      this.seleccionados.delete(id);
    } else {
      this.seleccionados.add(id);
    }
  }

  toggleTodos(): void {
    if (this.seleccionados.size === this.registros.length) {
      this.seleccionados.clear();
    } else {
      this.registros.forEach(r => this.seleccionados.add(r.id));
    }
  }

  volver(): void { this.location.back(); }

  // ── CRUD ──

  nuevo(): void { this.router.navigate(['/sigsa3/nuevo']); }

  editar(id: number): void { this.router.navigate(['/sigsa3/editar', id]); }

  importar(): void { this.router.navigate(['/sigsa3/importar']); }

  gestionarPersonalSalud(): void { this.router.navigate(['/personal-salud']); }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este registro?')) return;
    this.api.eliminarRegistro(id).pipe(takeUntil(this.destroy$)).subscribe({ next: () => { this.cargar(); this.cdr.markForCheck(); } });
  }

  eliminarSeleccionados(): void {
    if (this.seleccionados.size === 0) return;
    if (!confirm(`¿Eliminar ${this.seleccionados.size} registros seleccionados?`)) return;
    this.api.eliminarPorIds([...this.seleccionados]).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.seleccionados.clear(); this.cargar(); this.cdr.markForCheck(); }
    });
  }

  // ── Modal Período ──

  abrirModalPeriodo(): void {
    this.modalPeriodo = true;
    this.resultadoOperacion = null;
    const hoy = new Date();
    this.HastaPeriodo = hoy.toISOString().split('T')[0];
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.DesdePeriodo = inicio.toISOString().split('T')[0];
  }

  cerrarModalPeriodo(): void { this.modalPeriodo = false; }

  eliminarPorPeriodo(): void {
    if (!this.DesdePeriodo || !this.HastaPeriodo) return;
    this.procesando = true;
    this.api.eliminarPorPeriodo(this.DesdePeriodo, this.HastaPeriodo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.resultadoOperacion = res; this.procesando = false; this.cargar(); this.cdr.markForCheck(); },
      error: () => { this.procesando = false; this.cdr.markForCheck(); }
    });
  }

  // ── Modal Asociar ──

  abrirModalAsociar(): void {
    this.modalAsociar = true;
    this.resultadoOperacion = null;
    this.asociarExpediente = '';
    this.asociarHistoria = '';
  }

  cerrarModalAsociar(): void { this.modalAsociar = false; }

  asociarPaciente(): void {
    if (!this.asociarExpediente || !this.asociarHistoria) return;
    this.procesando = true;
    this.api.asociarPaciente(this.asociarExpediente, this.asociarHistoria).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.resultadoOperacion = res; this.procesando = false; this.cargar(); this.cdr.markForCheck(); },
      error: () => { this.procesando = false; this.cdr.markForCheck(); }
    });
  }

  asociarMedico(): void {
    this.procesando = true;
    this.api.asociarMedico().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.resultadoOperacion = res; this.procesando = false; this.cdr.markForCheck(); },
      error: () => { this.procesando = false; this.cdr.markForCheck(); }
    });
  }

  asociarTodo(): void {
    this.procesando = true;
    this.progreso = null;
    this.api.asociarTodoStream().pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => {
        this.progreso = p;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.procesando = false;
        this.cargar();
        this.cdr.markForCheck();
      },
      error: () => {
        this.procesando = false;
        this.cdr.markForCheck();
      }
    });
  }

  sincronizarEspecialidad(): void {
    this.procesando = true;
    this.api.sincronizarEspecialidad().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.resultadoOperacion = res;
        this.procesando = false;
        this.cargar();
        this.cdr.markForCheck();
      },
      error: () => { this.procesando = false; this.cdr.markForCheck(); }
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

  get registrosPaginados(): Sigsa3Out[] {
    const inicio = (this.paginaActual - 1) * this.pageSize;
    return this.registros.slice(inicio, inicio + this.pageSize);
  }
}
