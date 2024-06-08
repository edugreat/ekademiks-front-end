import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionSortPipe } from '../option-sort.pipe';
import { SortPipe } from '../sort.pipe';



@NgModule({
  declarations: [OptionSortPipe, SortPipe],
  imports: [
    FormsModule, 
  ],
  exports:[FormsModule, OptionSortPipe,SortPipe]
})
export class SharedModule { }
