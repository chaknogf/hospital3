import { Injectable, signal, computed, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, from, defer, throwError } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { OfflineDatabaseService, PendingMutation } from './offline-database.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  isOnline = signal(true);
  pendingMutations = signal<number>(0);
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

  preCache<T>(key: string, request$: Observable<T>, ttl: number = 60 * 60 * 1000): void {
    if (!this.online) return;
    request$.pipe(
      tap(data => this.db.setCache(key, data, ttl)),
      catchError(() => of(null))
    ).subscribe();
  }

  cacheKey(url: string, params?: HttpParams | any): string {
    const paramsStr = params ? (typeof params === 'string' ? params : params.toString()) : '';
    return `${url}|${paramsStr}`;
  }

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

  async syncNow(): Promise<{ synced: number; failed: number }> {
    if (!this.online) return { synced: 0, failed: 0 };

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
        if (mutation.retries >= this.MAX_RETRIES) {
          await this.db.deleteMutation(mutation.id!);
        } else {
          await this.db.mutations.update(mutation.id!, { retries: mutation.retries + 1 });
        }
      }
    }

    await this.refreshPendingCount();
    this.lastSync.set(new Date());
    return { synced, failed };
  }

  private executeMutation(mutation: PendingMutation): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...mutation.headers
    };

    const token = localStorage.getItem('access_token');
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
