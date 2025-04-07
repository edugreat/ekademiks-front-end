import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { SharedModule } from '../shared/shared.module';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { RouterModule } from '@angular/router';



@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
        AuthComponent, AccessDeniedComponent
    ],
    exports: [
        AuthComponent
    ]
})
export class AuthModule { }
