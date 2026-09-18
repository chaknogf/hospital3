import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, finalize, switchMap } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import {
  Prestamo,
  PrestamoCreate,
  PrestamoUpdate,
  PrestamoListResponse,
  FiltroPrestamos
} from '../../interface/prestamos';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrestamosService extends BaseApiService {

  private prestamosSubject = new BehaviorSubject<Prestamo[]>([]);
  prestamos$ = this.prestamosSubject.asObservable();

  // Total de registros para paginación
  total = signal<number>(0);

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
  // LISTAR PRESTAMOS — ahora responde PrestamoListResponse
  // =========================================================

  getPrestamos(filtros: FiltroPrestamos = {}): Observable<PrestamoListResponse> {
    this.ultimoFiltro.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http
      .get<PrestamoListResponse>(`${this.baseUrl}/prestamos/`, { params })
      .pipe(
        tap(response => {
          this.prestamosSubject.next(response.items);  // ← items al subject
          this.total.set(response.total);              // ← total al signal
        }),
        catchError(error => this.manejarError(error, 'obtener préstamos'))
      );
  }

  // =========================================================
  // PRESTAMOS ACTIVOS (para indicadores en listados)
  // No toca prestamosSubject ni total para no pisar el listado activo.
  // =========================================================

  obtenerPrestamosActivos(): Observable<Prestamo[]> {
    const limite = 100;

    const acumular = (skip: number, acumulado: Prestamo[]): Observable<Prestamo[]> => {
      const params = this.limpiarParametros({ activo: true, skip, limit: limite });
      return this.http
        .get<PrestamoListResponse>(`${this.baseUrl}/prestamos/`, { params })
        .pipe(
          switchMap(res => {
            const items = acumulado.concat(res.items);
            const hayMas = items.length < res.total && res.items.length === limite;
            return hayMas ? acumular(skip + limite, items) : of(items);
          }),
          catchError(error => this.manejarError(error, 'obtener préstamos activos'))
        );
    };

    return acumular(0, []);
  }

  // =========================================================
  // OBTENER PRESTAMO
  // =========================================================

  getPrestamo(id: number): Observable<Prestamo> {
    return this.http
      .get<Prestamo>(`${this.baseUrl}/prestamos/${id}`)
      .pipe(
        catchError(error => this.manejarError(error, 'obtener préstamo'))
      );
  }

  // =========================================================
  // CREAR PRESTAMO
  // =========================================================

  crearPrestamo(data: PrestamoCreate): Observable<Prestamo> {
    this.isLoading.set(true);
    return this.http
      .post<Prestamo>(`${this.baseUrl}/prestamos/`, data)
      .pipe(
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
    return this.http
      .put<Prestamo>(`${this.baseUrl}/prestamos/${id}`, datos)
      .pipe(
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
    return this.http
      .delete<{ detail: string }>(`${this.baseUrl}/prestamos/${id}`)
      .pipe(
        tap(() => this.refrescarPrestamos()),
        catchError(error => this.manejarError(error, 'eliminar préstamo')),
        finalize(() => this.isLoading.set(false))
      );
  }
}
