import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const accessToken = sessionStorage.getItem('accessToken');

  if (accessToken) {
    const Authorization = `Bearer ${accessToken}`;

    return next(req.clone({ setHeaders: { Authorization } })).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized && !authService.refreshTokenInProcess) {
          authService.refreshTokenInProcess = true;

          return authService.requestNewToken().pipe(
            switchMap(() => {
              authService.refreshTokenInProcess = false;
              const newAccessToken = sessionStorage.getItem('accessToken');
              const newAuthorization = `Bearer ${newAccessToken}`;

              return next(req.clone({ setHeaders: { Authorization: newAuthorization } }));
            }),
            catchError(err => {
              authService.refreshTokenInProcess = false;
              sessionStorage.removeItem('refreshToken');
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        } else if (error.status === HttpStatusCode.Forbidden) {
          router.navigate(['/no-access', error.status]);
        } else if (error.status === HttpStatusCode.NotAcceptable) {
          authService.logout();
          router.navigate(['/disabled']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
