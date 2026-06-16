import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfflineSyncService } from './offline-sync.service';

export interface PaginationState {
  filtro: any;
}

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  //public readonly baseUrl = 'http://localhost:8000';
  public readonly baseUrl = 'https://www.htecpan.com/fah';

  isLoading = signal(false);
  token = signal<string | null>(null);
  username = signal<string | null>(null);
  role = signal<string | null>(null);

  protected sync = inject(OfflineSyncService);

  constructor(
    protected http: HttpClient,
    protected router: Router
  ) { }

  protected cacheGet<T>(key: string, request$: Observable<T>, ttl = 25 * 60 * 1000): Observable<T> {
    return this.sync.cacheGet(key, request$, ttl);
  }

  protected cacheKey(url: string, params?: any): string {
    return this.sync.cacheKey(url, params);
  }

  protected offMutation(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: any): Observable<any> {
    const operacion = url.split('/').pop() || 'operación';
    if (!this.sync.isOnline()) {
      this.sync.enqueueMutation(method, url, body);
      return of({ queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' });
    }
    let req$: Observable<any>;
    switch (method) {
      case 'POST': req$ = this.http.post(url, body); break;
      case 'PUT': req$ = this.http.put(url, body); break;
      case 'PATCH': req$ = this.http.patch(url, body); break;
      case 'DELETE': req$ = this.http.delete(url); break;
    }
    return req$.pipe(
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          this.sync.enqueueMutation(method, url, body);
          return of({ queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' });
        }
        return this.manejarError(error, operacion);
      })
    );
  }

  protected limpiarParametros(filtros: any): HttpParams {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  protected manejarError(error: any, operacion: string) {
    console.error(`❌ Error al ${operacion}:`, error);
    if (error instanceof HttpErrorResponse && error.status === 401) {
      localStorage.clear();
      this.token.set(null);
      this.router.navigate(['/inicio']);
    }
    return throwError(() => error);
  }

  protected hoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
