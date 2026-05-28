// listarPrestamos.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../prestamos.service';
import { FiltroPrestamos, Prestamo } from '../../../interface/prestamos';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  addIcon, arrowDown, cancelIcon, editIcon, findIcon,
  menuIcon, removeIcon, searchIcon, skipLeft, skipRight,  // ← skipRight correcto
  tablaShanonIcon, compartirIcon
} from '../../../shared/icons/svg-icon';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listarPrestamos',
  templateUrl: './listarPrestamos.component.html',
  styleUrls: ['./listarPrestamos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ListarPrestamosComponent implements OnInit {

  private api = inject(PrestamosService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  prestamos: Prestamo[] = [];
  cargando = false;
  filtrar = false;
  visible = false;
  finPagina = false;
  rowActiva: number | null = null;

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
  compartirIcon!: SafeHtml;

  // Filtros — incluye los nuevos campos y paginación
  filtros: FiltroPrestamos = {
    activo: true,
    id_paciente: null,
    expediente: null,
    tipo_documento: null,
    nombre_paciente: null,
    skip: 0,
    limit: this.limit,
  };

  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  ngOnInit(): void {
    this.inicializarIconos();
    this.api.prestamos$.subscribe(data => {
      this.prestamos = data;
      this.cargando = false;
      // Desactiva botón siguiente si hay menos registros que el límite
      this.finPagina = data.length < this.limit;
    });
    this.cargarPrestamos();
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
    this.skipLeftIcon = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRightIcon = this.sanitizer.bypassSecurityTrustHtml(skipRight);  // ← corregido
  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  cargarPrestamos(): void {
    this.cargando = true;
    this.api.getPrestamos(this.filtros).subscribe({
      error: () => this.mostrarMensaje('Error al cargar los préstamos', 'error')
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      activo: true,
      id_paciente: null,
      expediente: null,
      tipo_documento: null,
      nombre_paciente: null,
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
    this.api.eliminarPrestamo(id).subscribe({
      next: () => this.mostrarMensaje('Préstamo desactivado', 'success'),
      error: () => this.mostrarMensaje('Error al desactivar el préstamo', 'error')
    });
  }

  editar(id: number): void {
    this.router.navigate(['/editarPrestamo', id]);
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
