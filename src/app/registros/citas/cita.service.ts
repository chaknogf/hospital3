import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../../service/base-api.service';
import { FiltroCitas } from '../../interface/filtros.model';
import { CitaCreate, CitaListResponse, CitaResponse, Citas, ConteoCitas } from '../../interface/citas';

@Injectable({ providedIn: 'root' })
export class CitaService extends BaseApiService {

  private citasSubject = new BehaviorSubject<CitaResponse[]>([]);
  citas$ = this.citasSubject.asObservable();

  private ultimoFiltroCitas: PaginationState = {
    filtro: { skip: 0, limit: 200, fecha_cita: this.hoy() }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  private refrescarCitas(): void {
    this.getCitas(this.ultimoFiltroCitas.filtro).subscribe();
  }

  getCitas(filtros: FiltroCitas): Observable<CitaListResponse> {
    this.ultimoFiltroCitas.filtro = filtros;
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/citas/`, params);
    return this.cacheGet(key,
      this.http.get<CitaListResponse>(`${this.baseUrl}/citas/`, { params }).pipe(
        tap(response => this.citasSubject.next(response.citas)),
        catchError(error => this.manejarError(error, 'obtener citas'))
      )
    );
  }

  getCita(id: number): Observable<Citas> {
    const url = `${this.baseUrl}/citas/${id}`;
    const key = this.cacheKey(url);
    return this.cacheGet(key,
      this.http.get<Citas>(url).pipe(
        catchError(error => this.manejarError(error, 'obtener cita'))
      )
    );
  }

  crearCita(cita: CitaCreate): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/citas/`, cita).pipe(
      tap(() => this.refrescarCitas()),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateCita(id: number, datos: any): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/citas/${id}`, datos).pipe(
      tap(() => this.refrescarCitas()),
      finalize(() => this.isLoading.set(false))
    );
  }

  conteoCitas(filtros: any): Observable<ConteoCitas[]> {
    this.ultimoFiltroCitas.filtro = filtros;
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/citas/disponibles`, params);
    return this.cacheGet(key,
      this.http.get<ConteoCitas[]>(`${this.baseUrl}/citas/disponibles`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener regsitradas'))
      ),
      5 * 60 * 1000
    );
  }
}
