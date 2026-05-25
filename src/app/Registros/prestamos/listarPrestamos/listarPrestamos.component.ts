import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../prestamos.service';
import { FiltroPrestamos, Prestamo } from '../../../interface/prestamos';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { addIcon, arrowDown, cancelIcon, editIcon, findIcon, menuIcon, removeIcon, searchIcon, skipLeft, tablaShanonIcon } from '../../../shared/icons/svg-icon';
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

  private prestamosService = inject(PrestamosService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  prestamos$ = this.prestamosService.prestamos$;
  isLoading = this.prestamosService.isLoading;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  finPagina: boolean = false;
  rowActiva: number | null = null;

  //======== ICONOS ======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  arrowDown!: SafeHtml;
  tablaShanonIcon!: SafeHtml;
  editIcon!: SafeHtml;
  skipRight!: SafeHtml;
  skipLeft!: SafeHtml;
  menuIcon!: SafeHtml;


  // Filtros
  filtros: FiltroPrestamos = {
    activo: true,
    id_paciente: null
  };

  // Control del modal de edición
  prestamoSeleccionado = signal<Prestamo | null>(null);
  mostrarModal = signal(false);

  // Mensaje de feedback
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  ngOnInit(): void {
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
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.skipLeft = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRight = this.sanitizer.bypassSecurityTrustHtml(skipLeft);

  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  cargarPrestamos(): void {
    // Limpia nulos para no enviar parámetros vacíos
    const filtrosLimpios: FiltroPrestamos = {};
    if (this.filtros.activo !== null && this.filtros.activo !== undefined) {
      filtrosLimpios.activo = this.filtros.activo;
    }
    if (this.filtros.id_paciente) {
      filtrosLimpios.id_paciente = this.filtros.id_paciente;
    }

    this.prestamosService.getPrestamos(filtrosLimpios).subscribe({
      error: () => this.mostrarMensaje('Error al cargar los préstamos', 'error')
    });
  }

  abrirEdicion(prestamo: Prestamo): void {
    this.prestamoSeleccionado.set({ ...prestamo });
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.prestamoSeleccionado.set(null);
    this.mostrarModal.set(false);
  }



  desactivar(id: number): void {
    if (!confirm('¿Desea desactivar este préstamo?')) return;

    this.prestamosService.eliminarPrestamo(id).subscribe({
      next: () => this.mostrarMensaje('Préstamo desactivado', 'success'),
      error: () => this.mostrarMensaje('Error al desactivar el préstamo', 'error')
    });
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.mensaje.set(null), 3500);
  }

  // Utilidad de formato
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

  // ======= UTILIDADES =======
  trackById(_index: number, prestamo: Prestamo): number {
    return prestamo.id;
  }

  volver(): void {
    this.location.back();
  }

  editar(id: number): void {
    this.router.navigate(['/editarPrestamo', id]);
  }
}
