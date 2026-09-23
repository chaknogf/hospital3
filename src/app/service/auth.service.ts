import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { OfflineSyncService } from './offline-sync.service';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private sync = inject(OfflineSyncService);

  // Signals de autenticación
  token = signal<string | null>(null);
  username = signal<string | null>(null);
  role = signal<string | null>(null);
  nombreUsuario = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.cargarTokenDelStorage();
  }

  // ── Login ──────────────────────────────────────────────
  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/auth/login`, body
    ).pipe(
      tap(response => {
        if (!response.access_token) throw new Error('No se recibió el token.');
        localStorage.setItem('access_token', response.access_token);
        this.token.set(response.access_token);
        this.preCacheReferenceData();
        this.getCurrentUser().subscribe({
          next: () => this.router.navigate(['/dash']),
          error: () => this.router.navigate(['/dash'])
        });
      }),
      catchError(error => this.manejarError(error, 'iniciar sesión'))
    );
  }

  // ── Usuario actual ─────────────────────────────────────
  getCurrentUser(): Observable<any> {
    return this.http.get<{ username: string; role: string; nombre: string }>(
      `${this.baseUrl}/auth/me`,
      {
        headers: {
          usuario: this.username() || '',
          rol: this.role() || '',
          nombre: this.nombreUsuario() || ''
        }
      }
    ).pipe(
      tap(response => {
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
        localStorage.setItem('nombreUsuario', response.nombre);
        this.username.set(response.username);
        this.role.set(response.role);
        this.nombreUsuario.set(response.nombre);
      }),
      catchError(error => this.manejarError(error, 'obtener usuario actual'))
    );
  }

  getUsuarioActual(): { username: string; role: string; nombre: string } {
    return {
      username: this.username() ?? localStorage.getItem('username') ?? 'sistema',
      role: this.role() ?? localStorage.getItem('role') ?? 'SIN_ROL',
      nombre: this.nombreUsuario() ?? localStorage.getItem('nombreUsuario') ?? ''
    };
  }

  // ── Logout ─────────────────────────────────────────────
  logOut(): void {
    this.sync.clearOnLogout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('nombreUsuario');
    this.token.set(null);
    this.username.set(null);
    this.role.set(null);
    this.nombreUsuario.set(null);
    this.router.navigate(['/inicio']);
  }

  // ── Privados ───────────────────────────────────────────
  private tokenExpirado(token: string): boolean {
    try {
      const parte = token.split('.')[1];
      if (!parte) return false;
      const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      const exp = payload?.exp;
      if (typeof exp === 'number' && exp > 0) {
        return exp * 1000 < Date.now();
      }
      return false;
    } catch {
      return false;
    }
  }

  private cargarTokenDelStorage(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.limpiarSesionLocal();
      return;
    }
    if (this.tokenExpirado(token)) {
      this.limpiarSesionLocal();
      return;
    }
    this.token.set(token);
    this.username.set(localStorage.getItem('username'));
    this.role.set(localStorage.getItem('role'));
    this.nombreUsuario.set(localStorage.getItem('nombreUsuario'));
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('nombreUsuario');
    this.token.set(null);
    this.username.set(null);
    this.role.set(null);
    this.nombreUsuario.set(null);
  }

  private manejarError(error: any, operacion: string) {
    console.error(`❌ Error al ${operacion}:`, error);
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.logOut();
    }
    return throwError(() => error);
  }

  private preCacheReferenceData(): void {
    const ttl = 60 * 60 * 1000;
    this.sync.preCache(
      this.sync.cacheKey(`${this.baseUrl}/municipios/departamentos`),
      this.http.get(`${this.baseUrl}/municipios/departamentos`),
      ttl
    );
    this.sync.preCache(
      this.sync.cacheKey(`${this.baseUrl}/paises/`),
      this.http.get(`${this.baseUrl}/paises/`),
      ttl
    );
  }
}
