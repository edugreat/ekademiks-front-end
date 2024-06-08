import { Pipe, PipeTransform } from '@angular/core';
import { Option } from './test/test-interface';

@Pipe({
  name: 'optionSort'
  
})
export class OptionSortPipe implements PipeTransform {

  transform(value: Option[]): Option[] {
    if(value){

      return  value.sort((opt1:Option, opt2:Option) =>{
        const option1 = opt1.letter;
        const option2 = opt2.letter;
        if(option1 < option2) return -1;

        else if(option1 > option2) return 1;
        return 0;
      });
    }

    return [];
  }

}
