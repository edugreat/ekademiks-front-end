import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, Subscription, switchMap, take, throwError } from 'rxjs';
import { AuthService, User } from './auth.service';
//Intercepts all outgoing http calls and injects the authorization tokens if it exists
@Injectable()
export class AuthInterceptor implements HttpInterceptor{





  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const router = inject(Router);
    const authService = inject(AuthService);
    //gets the authorization token
    const accessToken  = sessionStorage.getItem('accessToken');
   
    if(accessToken){
     

      const Authorization = `Bearer ${accessToken}`;
      
      return next.handle(req.clone({setHeaders:{Authorization}})).pipe(

       
        catchError((error: HttpErrorResponse) =>{

          //check if the error is access denied error

          if(error.status === HttpStatusCode.Unauthorized && !authService.refreshTokenInProcess){

            
            // This ensures no other request proceeds while attempt to get new token is in progress
            authService.refreshTokenInProcess = true;

            return authService.requestNewToken().pipe(

              // retries previous request that got rejected due to access token expiration
              switchMap(() => {
                
                authService.refreshTokenInProcess = false;

                // gets the newly generated access token
                const accessToken =  sessionStorage.getItem('accessToken');;

                // creates new authorizatuin header
                const Authorization = `Bearer ${accessToken}`;

                return next.handle(
                  req.clone({
                    
                    setHeaders:{Authorization}
                  }));

              }),
              catchError(err => {
                authService.refreshTokenInProcess = false;
                
                // This means attempt to secure new access token failed
                // This is possible if the user tempered with the existing refresh token
                // Hence remove the existing refresh token and redirect them to the login page

                sessionStorage.removeItem('refreshToken');

                // The user would be notified about the error, then be taken to the login page
                // router.navigate(['/no-access', error.status]);
               authService.logout();
                router.navigate(['/login']);

                return throwError(() => err);
              }));
           

          } else if(error.status == HttpStatusCode.Forbidden){

            // takes them to the no access page to show them they do not have authority to access the resource,
            // then they would be redirected to their previous page
            router.navigate(['/no-access', error.status]);

            // This code is executed for logged in user whose account suddenly got disabled
          }else if(error.status === HttpStatusCode.NotAcceptable){

          // logs the current user out
          authService.logout();

            router.navigate(['/disabled'])
          }
          return throwError(() => error)
        })
      )
    }

  return next.handle(req)

  }
}
