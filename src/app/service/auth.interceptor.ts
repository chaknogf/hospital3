import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);

  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // La sesión caducó o fue revocada: además de limpiar el storage,
        // limpia las señales en memoria para que el navbar (y todo el app)
        // deje de mostrar usuario/rol de inmediato.
        api.logOut();
      }
      return throwError(() => error);
    })
  );
};
