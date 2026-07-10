import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

const RETRY_COUNT = 2;
const RETRY_DELAY = 800;

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: RETRY_COUNT,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        const isNetworkError = error.status === 0;
        const isServerError = [502, 503, 504].includes(error.status);

        if (isNetworkError || isServerError) {
          return timer(RETRY_DELAY * retryCount);
        }
        return throwError(() => error);
      }
    })
  );
};
