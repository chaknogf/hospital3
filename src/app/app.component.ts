import { Component, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './principal/navbar/navbar.component';
import { ApiService } from './service/api.service';
import { OfflineSyncService } from './service/offline-sync.service';
import { FullSyncService } from './service/full-sync.service';
import { filter } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { OfflineBannerComponent } from './pwa/offline-banner.component';
import { UpdateNotificationComponent } from './pwa/update-notification.component';
import { HttpClient } from '@angular/common/http';

import localeEs from '@angular/common/locales/es';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, OfflineBannerComponent, UpdateNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'medicalApp';
  modalActivo = false;

  estaAutenticado = computed(() => !!this.api.token());
  username = computed(() => this.api.username() || '');
  role = computed(() => 'Rol: ' + (this.api.role() || ''));

  private syncTriggered = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private sync: OfflineSyncService,
    public fullSync: FullSyncService,
    private http: HttpClient
  ) {
    registerLocaleData(localeEs);
    this.detectarRuta();
  }

  private triggerFullSync(): void {
    if (this.syncTriggered) return;
    this.syncTriggered = true;
    this.fullSync.syncAll(false).catch(err => {
      console.warn('Sincronización inicial falló, se reintentará:', err);
    });
  }

  detectarRuta() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((evento) => {
        const url = evento.urlAfterRedirects;

        if (url === '/' || url.includes('/inicio')) {
          this.syncTriggered = false;
        } else if (this.api.token()) {
          this.preCacheReferenceData();
          this.triggerFullSync();
        }
      });
  }

  private preCacheReferenceData(): void {
    const ttl = 60 * 60 * 1000;
    this.sync.preCache(
      this.sync.cacheKey(`${this.api.baseUrl}/municipios/departamentos`),
      this.http.get(`${this.api.baseUrl}/municipios/departamentos`),
      ttl
    );
    this.sync.preCache(
      this.sync.cacheKey(`${this.api.baseUrl}/paises/`),
      this.http.get(`${this.api.baseUrl}/paises/`),
      ttl
    );
  }

  desconectarUsuario() {
    this.api.logOut();
  }

  reSync(): void {
    this.fullSync.syncAll(true).catch(err => {
      console.warn('Re-sincronización falló, se reintentará:', err);
    });
  }

  toggleSyncPause(): void {
    const state = this.fullSync.syncState();
    if (state === 'syncing') {
      this.fullSync.pause();
    } else if (state === 'paused') {
      this.fullSync.resume();
    }
  }

  cancelSync(event: MouseEvent): void {
    event.stopPropagation();
    this.fullSync.cancel();
  }
}
