// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  console.log('🟡 Interceptor activo en:', req.url); // ← ¿aparece esto?

  return next(req).pipe(
    catchError((error) => {
      console.log('🔴 Error capturado, status:', error.status); // ← ¿aparece esto?

      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('🔴 Redirigiendo a /inicio...'); // ← ¿aparece esto?
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        router.navigate(['/inicio']);
      }

      return throwError(() => error);
    })
  );
};
