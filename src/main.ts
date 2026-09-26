import 'iconify-icon';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/service/auth.interceptor';
import { retryInterceptor } from './app/service/retry.interceptor';

// El reintento se limita a GET y el interceptor de autenticación añade el JWT;
// ninguna escritura se repite automáticamente para evitar duplicar operaciones.
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideHttpClient(
      withFetch(),
      withInterceptors([retryInterceptor, authInterceptor])
    ),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000'
    })
  ]
}).catch(err => console.error(err));
