// listarPrestamos.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../prestamos.service';
import { FiltroPrestamos, Prestamo, PrestamoUpdate } from '../../../interface/prestamos';
import { PacienteService } from '../../patient/paciente.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  addIcon, arrowDown, cancelIcon, editIcon, findIcon,
  menuIcon, removeIcon, searchIcon, skipLeft, skipRight,  // ← skipRight correcto
  tablaShanonIcon, compartirIcon, prestarIcon, recibidoIcon
} from '../../../shared/icons/svg-icon';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listarPrestamos',
  templateUrl: './listarPrestamos.component.html',
  styleUrls: ['./listarPrestamos.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class ListarPrestamosComponent implements OnInit, OnDestroy {

  private api = inject(PrestamosService);
  private pacienteApi = inject(PacienteService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  prestamos: Prestamo[] = [];
  cargando = false;
  filtrar = false;
  visible = false;
  finPagina = false;
  rowActiva: number | null = null;

  // ── Panel "Nuevo préstamo" (búsqueda por expediente) ──
  nuevoPrestamo = false;
  expedienteNuevo = '';
  buscandoPaciente = false;

  // Exponer total y página actual para el template
  total = this.api.total;
  readonly limit = 20;

  //======== ICONOS ======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  arrowDown!: SafeHtml;
  editIcon!: SafeHtml;
  skipRightIcon!: SafeHtml;
  skipLeftIcon!: SafeHtml;
  menuIcon!: SafeHtml;
  prestarIcon!: SafeHtml;
  recibidoIcon!: SafeHtml;
  compartirIcon!: SafeHtml;

  // Filtros — incluye los nuevos campos y paginación
  filtros: FiltroPrestamos = {
    activo: true,
    id_paciente: null,
    expediente: null,
    tipo_documento: null,
    nombre_paciente: null,
    fecha_desde: null,
    fecha_hasta: null,
    skip: 0,
    limit: this.limit,
  };

  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  ngOnInit(): void {
    this.inicializarIconos();
    this.api.prestamos$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.prestamos = data;
      this.cargando = false;
      // Desactiva botón siguiente si hay menos registros que el límite
      this.finPagina = data.length < this.limit;
      this.cdr.markForCheck();
    });
    this.cargarPrestamos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.menuIcon = this.sanitizer.bypassSecurityTrustHtml(menuIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.arrowDown = this.sanitizer.bypassSecurityTrustHtml(arrowDown);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.prestarIcon = this.sanitizer.bypassSecurityTrustHtml(prestarIcon);
    this.recibidoIcon = this.sanitizer.bypassSecurityTrustHtml(recibidoIcon);
    this.skipLeftIcon = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRightIcon = this.sanitizer.bypassSecurityTrustHtml(skipRight);  // ← corregido
  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  cargarPrestamos(): void {
    this.cargando = true;
    this.api.getPrestamos(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      error: () => { this.mostrarMensaje('Error al cargar los préstamos', 'error'); this.cdr.markForCheck(); }
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      activo: true,
      id_paciente: null,
      expediente: null,
      tipo_documento: null,
      nombre_paciente: null,
      fecha_desde: null,
      fecha_hasta: null,
      skip: 0,
      limit: this.limit,
    };
    this.cargarPrestamos();
  }

  // ======= PAGINACIÓN =======
  get paginaActual(): number {
    return Math.floor((this.filtros.skip ?? 0) / this.limit) + 1;
  }

  get totalPaginas(): number {
    return Math.ceil(this.total() / this.limit);
  }

  paginaAnterior(): void {
    if ((this.filtros.skip ?? 0) === 0) return;
    this.filtros.skip = (this.filtros.skip ?? 0) - this.limit;
    this.cargarPrestamos();
  }

  paginaSiguiente(): void {
    if (this.finPagina) return;
    this.filtros.skip = (this.filtros.skip ?? 0) + this.limit;
    this.cargarPrestamos();
  }

  // ======= ACCIONES =======
  desactivar(id: number): void {
    if (!confirm('¿Desea desactivar este préstamo?')) return;
    this.api.eliminarPrestamo(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.mostrarMensaje('Préstamo desactivado', 'success'); this.cdr.markForCheck(); },
      error: () => { this.mostrarMensaje('Error al desactivar el préstamo', 'error'); this.cdr.markForCheck(); }
    });
  }

  editar(id: number): void {
    this.router.navigate(['/editarPrestamo', id]);
  }

  // ======= NUEVO PRÉSTAMO (búsqueda por expediente) =======
  toggleNuevo(): void {
    this.nuevoPrestamo = !this.nuevoPrestamo;
  }

  buscarPacienteParaPrestamo(): void {
    const exp = (this.expedienteNuevo ?? '').trim();
    if (!exp) {
      this.mostrarMensaje('Escribe un expediente para buscar al paciente.', 'error');
      return;
    }
    this.buscandoPaciente = true;
    this.cdr.markForCheck();

    this.pacienteApi.pacienteExpediente(exp).pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => {
        this.buscandoPaciente = false;
        if (!p?.id) {
          this.mostrarMensaje('No se encontró paciente con ese expediente.', 'error');
          this.cdr.markForCheck();
          return;
        }
        this.router.navigate(['/prestamo', p.id]);
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarMensaje('No se encontró paciente con ese expediente.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  // ======= DEVOLVER / REENTREGAR (cambio de estado) =======
  devolver(p: Prestamo): void {
    if (!confirm(`¿Registrar la devolución del expediente ${p.expediente ?? ''}?`)) return;
    const payload: PrestamoUpdate = { fecha_devolucion: new Date().toISOString() };
    this.api.actualizarPrestamo(p.id, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.mostrarMensaje('Préstamo devuelto correctamente.', 'success'); this.cdr.markForCheck(); },
      error: () => { this.mostrarMensaje('Error al registrar la devolución.', 'error'); this.cdr.markForCheck(); }
    });
  }

  reentregar(p: Prestamo): void {
    if (!confirm(`¿Reactivar (reentregar) el expediente ${p.expediente ?? ''}?`)) return;
    const payload: PrestamoUpdate = { fecha_devolucion: null };
    this.api.actualizarPrestamo(p.id, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.mostrarMensaje('Préstamo reactivado (entregado de nuevo).', 'success'); this.cdr.markForCheck(); },
      error: () => { this.mostrarMensaje('Error al reactivar el préstamo.', 'error'); this.cdr.markForCheck(); }
    });
  }

  // ======= ESTADO legible =======
  estadoPrestamo(p: Prestamo): { label: string; cls: string } {
    if (!p.activo) return { label: 'Devuelto', cls: 'badge-devuelto' };
    if (this.estaVencido(p)) return { label: 'Vencido', cls: 'badge-vencido' };
    return { label: 'Vigente', cls: 'badge-vigente' };
  }

  volver(): void {
    this.location.back();
  }

  // ======= UTILIDADES =======
  formatearFecha(fecha?: string | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  estaVencido(prestamo: Prestamo): boolean {
    if (!prestamo.fecha_limite || prestamo.fecha_devolucion) return false;
    return new Date(prestamo.fecha_limite) < new Date();
  }

  trackById(_index: number, prestamo: Prestamo): number {
    return prestamo.id;
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.mensaje.set(null), 3500);
  }
}
