import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CatalogoProcedimiento, AreaCuerpoIntervenida } from '../interface/procedimientos';

/** Acceso al catálogo maestro de procedimientos y áreas intervenidas. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Lista el catálogo maestro de procedimientos. */
  getCatalogoProcedimientos(filtros: {
    q?: string;
    especialidad_ref?: number;
    activo?: boolean;
    skip?: number;
    limit?: number;
  } = {}): Observable<CatalogoProcedimiento[]> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.especialidad_ref != null) params = params.set('especialidad_ref', String(filtros.especialidad_ref));
    if (filtros.activo != null) params = params.set('activo', String(filtros.activo));
    if (filtros.skip != null) params = params.set('skip', String(filtros.skip));
    if (filtros.limit != null) params = params.set('limit', String(filtros.limit));
    return this.http.get<CatalogoProcedimiento[]>(`${this.baseUrl}/catalogo-procedimientos/`, { params })
      .pipe(catchError(err => { throw err; }));
  }

  getCatalogoProcedimiento(id: number): Observable<CatalogoProcedimiento> {
    return this.http.get<CatalogoProcedimiento>(`${this.baseUrl}/catalogo-procedimientos/${id}`);
  }

  crearCatalogoProcedimiento(data: Partial<CatalogoProcedimiento>): Observable<CatalogoProcedimiento> {
    return this.http.post<CatalogoProcedimiento>(`${this.baseUrl}/catalogo-procedimientos/`, data);
  }

  actualizarCatalogoProcedimiento(id: number, data: Partial<CatalogoProcedimiento>): Observable<CatalogoProcedimiento> {
    return this.http.patch<CatalogoProcedimiento>(`${this.baseUrl}/catalogo-procedimientos/${id}`, data);
  }

  eliminarCatalogoProcedimiento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/catalogo-procedimientos/${id}`);
  }

  /** Lista el catálogo de áreas del cuerpo intervenidas. */
  getAreasCuerpo(activo: boolean = true): Observable<AreaCuerpoIntervenida[]> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.get<AreaCuerpoIntervenida[]>(`${this.baseUrl}/areas-cuerpo/`, { params });
  }
}