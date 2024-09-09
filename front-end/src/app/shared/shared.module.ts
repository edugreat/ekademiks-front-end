import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OptionSortPipe } from '../option-sort.pipe';
import { SortPipe } from '../sort.pipe';
import { MaterialModule } from '../material/material.module';
import { SpinnerComponent } from './spinner/spinner.component';
import { CommonModule } from '@angular/common';

import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { NumericDirective } from './numeric.directive';



@NgModule({
  declarations: [OptionSortPipe, SortPipe, 
    SpinnerComponent, ProgressBarComponent, ConfirmationComponent, NumericDirective],
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    
    
    
  ],
  exports:[FormsModule, ReactiveFormsModule, OptionSortPipe,SortPipe,
     SpinnerComponent, MaterialModule,
    ProgressBarComponent, ConfirmationComponent, NumericDirective
    ]
})
export class SharedModule { }
