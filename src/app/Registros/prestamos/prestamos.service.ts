import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { Prestamo, PrestamoCreate, PrestamoUpdate, FiltroPrestamos } from '../../interface/prestamos';

@Injectable({ providedIn: 'root' })
export class PrestamosService extends BaseApiService {

  private prestamosSubject = new BehaviorSubject<Prestamo[]>([]);
  prestamos$ = this.prestamosSubject.asObservable();

  private ultimoFiltro: PaginationState = {
    filtro: {}
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private refrescarPrestamos(): void {
    this.getPrestamos(this.ultimoFiltro.filtro).subscribe();
  }

  // =========================================================
  // LISTAR PRESTAMOS
  // =========================================================

  getPrestamos(filtros: FiltroPrestamos = {}): Observable<Prestamo[]> {
    this.ultimoFiltro.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<Prestamo[]>(`${this.baseUrl}/prestamos/`, { params }).pipe(
      tap(response => this.prestamosSubject.next(response)),
      catchError(error => this.manejarError(error, 'obtener préstamos'))
    );
  }

  // =========================================================
  // OBTENER PRESTAMO
  // =========================================================

  getPrestamo(id: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.baseUrl}/prestamos/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener préstamo'))
    );
  }

  // =========================================================
  // CREAR PRESTAMO
  // =========================================================

  crearPrestamo(data: PrestamoCreate): Observable<Prestamo> {
    this.isLoading.set(true);
    return this.http.post<Prestamo>(`${this.baseUrl}/prestamos/`, data).pipe(
      tap(() => this.refrescarPrestamos()),
      catchError(error => this.manejarError(error, 'crear préstamo')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // =========================================================
  // ACTUALIZAR PRESTAMO
  // =========================================================

  actualizarPrestamo(id: number, datos: PrestamoUpdate): Observable<Prestamo> {
    this.isLoading.set(true);
    return this.http.put<Prestamo>(`${this.baseUrl}/prestamos/${id}`, datos).pipe(
      tap(() => this.refrescarPrestamos()),
      catchError(error => this.manejarError(error, 'actualizar préstamo')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // =========================================================
  // ELIMINAR (DESACTIVAR) PRESTAMO
  // =========================================================

  eliminarPrestamo(id: number): Observable<{ detail: string }> {
    this.isLoading.set(true);
    return this.http.delete<{ detail: string }>(`${this.baseUrl}/prestamos/${id}`).pipe(
      tap(() => this.refrescarPrestamos()),
      catchError(error => this.manejarError(error, 'eliminar préstamo')),
      finalize(() => this.isLoading.set(false))
    );
  }
}
