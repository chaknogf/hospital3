import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './principal/navbar/navbar.component';
import { ApiService } from './service/api.service';
import { OfflineSyncService } from './service/offline-sync.service';
import { filter } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { OfflineBannerComponent } from './pwa/offline-banner.component';
import { UpdateNotificationComponent } from './pwa/update-notification.component';
import { HttpClient, HttpParams } from '@angular/common/http';

import localeEs from '@angular/common/locales/es';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, OfflineBannerComponent, UpdateNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'medicalApp';
  estaAutenticado = false;
  username = '';
  role = '';
  modalActivo = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private sync: OfflineSyncService,
    private http: HttpClient
  ) { registerLocaleData(localeEs); }

  ngOnInit() {
    this.detectarRuta();

    this.username = localStorage.getItem('username') || '';
    this.role = 'Rol: ' + localStorage.getItem('role') || '';
    if (this.username) {
      this.estaAutenticado = true;
      this.preCacheReferenceData();
    }
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
    this.sync.preCache(
      this.sync.cacheKey(`${this.api.baseUrl}/consultas/`, new HttpParams().set('skip', '0').set('limit', '14')),
      this.http.get(`${this.api.baseUrl}/consultas/`, { params: new HttpParams().set('skip', '0').set('limit', '14') }),
      30 * 60 * 1000
    );
  }

  detectarRuta() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((evento) => {
        const url = evento.urlAfterRedirects;

        if (url === '/' || url.includes('/inicio')) {
          this.estaAutenticado = false;
        } else {
          this.estaAutenticado = true;
        }
      });
  }

  desconectarUsuario() {
    console.log('Cerrando sesión...');

    this.api.logOut();

  }




}
