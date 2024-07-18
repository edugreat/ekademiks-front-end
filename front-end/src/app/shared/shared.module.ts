import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OptionSortPipe } from '../option-sort.pipe';
import { SortPipe } from '../sort.pipe';
import { MaterialModule } from '../material/material.module';
import { SpinnerComponent } from './spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';



@NgModule({
  declarations: [OptionSortPipe, SortPipe, 
    SpinnerComponent, ProgressBarComponent, ConfirmationComponent],
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    AppRoutingModule,
    
    
  ],
  exports:[FormsModule, ReactiveFormsModule, OptionSortPipe,SortPipe,
     SpinnerComponent, MaterialModule, AppRoutingModule,
    ProgressBarComponent, ConfirmationComponent
    ]
})
export class SharedModule { }
