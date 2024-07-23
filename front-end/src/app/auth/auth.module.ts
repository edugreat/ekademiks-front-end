import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';
import { SharedModule } from '../shared/shared.module';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [AuthComponent, AccessDeniedComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
   
  ],
  exports: [
    AuthComponent
  ]
})
export class AuthModule { }
