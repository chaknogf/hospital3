import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export interface PaginationState {
  filtro: any;
}

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly baseUrl = 'http://localhost:8000';

  isLoading = signal(false);
  token = signal<string | null>(null);
  username = signal<string | null>(null);
  role = signal<string | null>(null);

  constructor(
    protected http: HttpClient,
    protected router: Router
  ) { }

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
