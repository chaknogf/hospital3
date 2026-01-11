import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../service/api.service';

/**
 * Interceptor funcional para agregar token a las requests
 * Angular 20 usa interceptores funcionales en lugar de clases
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const apiService = inject(ApiService);

  // Obtener el token del signal
  const token = apiService.token();

  // Si hay token, agregarlo al header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
