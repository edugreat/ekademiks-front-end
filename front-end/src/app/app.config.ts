import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { myAppRoutes } from './app-routing/app-routing.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(myAppRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    BreakpointObserver,
  ]
};