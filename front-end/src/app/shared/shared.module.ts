import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionSortPipe } from '../option-sort.pipe';



@NgModule({
  declarations: [OptionSortPipe],
  imports: [
    FormsModule, 
  ],
  exports:[FormsModule, OptionSortPipe]
})
export class SharedModule { }
