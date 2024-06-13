import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionSortPipe } from '../option-sort.pipe';
import { SortPipe } from '../sort.pipe';
import { MaterialModule } from '../material/material.module';
import { SpinnerComponent } from './spinner/spinner.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [OptionSortPipe, SortPipe, SpinnerComponent],
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule 
  ],
  exports:[FormsModule, OptionSortPipe,SortPipe, SpinnerComponent]
})
export class SharedModule { }
