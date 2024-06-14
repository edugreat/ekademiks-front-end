import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SpinnerComponent } from '../shared/spinner/spinner.component';




@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AppRoutingModule,
    SharedModule,
   
   
  ],
  //exports:[HomeComponent]
})
export class HomeModule { }
