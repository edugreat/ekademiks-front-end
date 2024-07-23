import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { RouterModule } from '@angular/router';




@NgModule({
  declarations: [
    HomeComponent,
    WelcomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule
   
   
  ],
  //exports:[HomeComponent]
})
export class HomeModule { }
