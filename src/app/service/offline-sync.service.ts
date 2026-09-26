import { Injectable, signal, computed, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, from, defer, throwError } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { OfflineDatabaseService, PendingMutation } from './offline-database.service';

/** Coordina lecturas con caché y el envío recuperable de escrituras hechas offline. */
@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  isOnline = signal(true);
  pendingMutations = signal<number>(0);
  pendingMutationsList = signal<PendingMutation[]>([]);
  lastSync = signal<Date | null>(null);

  private online = true;

  constructor(
    private db: OfflineDatabaseService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.online = navigator.onLine;
      this.isOnline.set(navigator.onLine);
      this.refreshPendingCount().then(() => {
        if (this.online) this.syncNow();
      });

      window.addEventListener('online', () => this.goOnline());
      window.addEventListener('offline', () => this.goOffline());
    }
  }

  private goOnline(): void {
    this.online = true;
    this.isOnline.set(true);
    this.syncNow();
  }

  private goOffline(): void {
    this.online = false;
    this.isOnline.set(false);
  }

  private async refreshPendingCount(): Promise<void> {
    const count = await this.db.getPendingCount();
    this.pendingMutations.set(count);
    if (count > 0) {
      const mutations = await this.db.getPendingMutations();
      this.pendingMutationsList.set(mutations);
    } else {
      this.pendingMutationsList.set([]);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    return this.db.getCached<T>(key);
  }

  async setCachedData(key: string, data: any, ttl?: number): Promise<void> {
    return this.db.setCache(key, data, ttl);
  }

  async clearAllCache(): Promise<void> {
    await this.db.clearCache();
  }

  async clearOnLogout(): Promise<void> {
    await this.db.clearOnLogout();
  }

  /** Precarga datos de referencia solo en línea; un error no interrumpe el flujo. */
  preCache<T>(key: string, request$: Observable<T>, ttl: number = 60 * 60 * 1000): void {
    if (!this.online) return;
    request$.pipe(
      tap(data => this.db.setCache(key, data, ttl)),
      catchError(() => of(null))
    ).subscribe();
  }

  /** Genera una clave que distingue URL y parámetros para evitar mezclar filtros. */
  cacheKey(url: string, params?: HttpParams | any): string {
    const paramsStr = params ? (typeof params === 'string' ? params : params.toString()) : '';
    return `${url}|${paramsStr}`;
  }

  /**
   * Usa la copia local sin conexión y como respaldo ante fallos temporales en línea.
   * Las respuestas de error funcional, como 401 o 4xx, no se sustituyen por caché.
   */
  cacheGet<T>(
    cacheKey: string,
    request$: Observable<T>,
    ttl: number = 5 * 60 * 1000
  ): Observable<T> {
    if (!this.online) {
      return defer(() => from(this.db.getCached<T>(cacheKey))).pipe(
        switchMap(cached => {
          if (cached) return of(cached);
          return throwError(() => new Error('Sin conexión y no hay datos en caché'));
        })
      );
    }

    return request$.pipe(
      tap(data => this.db.setCache(cacheKey, data, ttl)),
      catchError(err => {
        if (!navigator.onLine || err.status === 0 || err.status === 503 || err.status === 502) {
          return defer(() => from(this.db.getCached<T>(cacheKey))).pipe(
            switchMap(cached => {
              if (cached) return of(cached);
              throw err;
            })
          );
        }
        throw err;
      })
    );
  }

  async clearPendingMutations(): Promise<void> {
    await this.db.clearMutations();
    await this.refreshPendingCount();
  }

  /** Persiste una escritura pendiente y actualiza el contador observable. */
  async enqueueMutation(
    method: PendingMutation['method'],
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<number> {
    const id = await this.db.addMutation({ method, url, body, headers, timestamp: Date.now(), retries: 0 });
    await this.refreshPendingCount();
    return id;
  }

  private readonly MAX_RETRIES = 5;
  private sincronizando = false;

  /** Envía la cola en serie; conserva fallos para reintento y evita duplicar envíos concurrentes. */
  async syncNow(): Promise<{ synced: number; failed: number }> {
    if (!this.online) return { synced: 0, failed: 0 };
    // Guarda anti-reentrancia: dos sincronizaciones simultáneas procesarían la
    // misma mutación y duplicarían registros (p. ej. un paciente offline).
    if (this.sincronizando) return { synced: 0, failed: 0 };
    this.sincronizando = true;

    try {
      const mutations = await this.db.getPendingMutations();
      let synced = 0;
      let failed = 0;

      for (const mutation of mutations) {
        try {
          await this.executeMutation(mutation);
          await this.db.deleteMutation(mutation.id!);
          synced++;
        } catch (err) {
          failed++;
          const mensaje = err instanceof Error ? err.message : String(err);
          console.warn(`[Sync] Error en ${mutation.method} ${mutation.url}:`, err);
          // NUNCA eliminar la mutación: borrarla sería pérdida silenciosa de datos.
          // Se conserva (marcada como "estancada") para reintento manual o posterior.
          const actualizacion: Partial<PendingMutation> = {
            retries: (mutation.retries ?? 0) + 1,
            lastError: mensaje.slice(0, 200)
          };
          if ((mutation.retries ?? 0) >= this.MAX_RETRIES) {
            actualizacion.stalled = true;
          }
          await this.db.mutations.update(mutation.id!, actualizacion);
        }
      }

      await this.refreshPendingCount();
      this.lastSync.set(new Date());
      return { synced, failed };
    } catch (err) {
      console.error('[Sync] Error inesperado en syncNow:', err);
      await this.refreshPendingCount();
      return { synced: 0, failed: 0 };
    } finally {
      this.sincronizando = false;
    }
  }

  private executeMutation(mutation: PendingMutation): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...mutation.headers
    };

    const token = localStorage.getItem('access_token');
    // El token se obtiene al sincronizar, no al encolar: la sesión puede haber
    // cambiado antes de recuperar la conexión y enviar la operación pendiente.
    if (token) headers['Authorization'] = `Bearer ${token}`;

    switch (mutation.method) {
      case 'POST':
        return this.http.post(mutation.url, mutation.body, { headers }).toPromise();
      case 'PUT':
        return this.http.put(mutation.url, mutation.body, { headers }).toPromise();
      case 'PATCH':
        return this.http.patch(mutation.url, mutation.body, { headers }).toPromise();
      case 'DELETE':
        return this.http.delete(mutation.url, { headers }).toPromise();
    }
  }
}
