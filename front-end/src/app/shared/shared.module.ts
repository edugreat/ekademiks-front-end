import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortPipe } from '../sort.pipe';
import { OptionSortPipe } from '../option-sort.pipe';



@NgModule({
  declarations: [
    SortPipe,
    OptionSortPipe
  ],

  exports:[
    SortPipe,
    OptionSortPipe
    
  ],
  imports: [
    CommonModule,
   
  ]
})
export class SharedModule { }
