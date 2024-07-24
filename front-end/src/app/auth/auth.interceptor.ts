import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, retry, throwError } from 'rxjs';
//Intercepts all outgoing http calls and injects the authorization tokens if it exists
export class AuthInterceptor implements HttpInterceptor{

 

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const router = inject(Router)
    //gets the authorization token from the local storage
    const token  = localStorage.getItem('token');
    if(token){

      const Authorization = `Bearer ${token}`;
      
      return next.handle(req.clone({setHeaders:{Authorization}})).pipe(

        retry(2),
        catchError((error: HttpErrorResponse) =>{

          //check if the error is access denied error
          if(error.status === HttpStatusCode.Unauthorized || error.status === HttpStatusCode.Forbidden){
           router.navigate(['/no-access', error.status]);

           return EMPTY;
          }
          return throwError(() => error)
        })
      )
    }

  return next.handle(req)

  }
}
