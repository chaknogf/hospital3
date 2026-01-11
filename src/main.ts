import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor'; // Si tienes interceptor

bootstrapApplication(AppComponent, {
  providers: [
    // ✅ HttpClient - REQUERIDO
    provideHttpClient(
      withInterceptors([authInterceptor]) // Si usas interceptor, agrégalo aquí
    ),

    // ✅ Router
    provideRouter(routes),

    // ✅ Animaciones
    provideAnimations()
  ]
}).catch(err => console.error(err));
