import { Pipe, PipeTransform } from '@angular/core';
import { Option } from './test/test-interface';

@Pipe({
  name: 'optionSort'
})
//pipe that sorts the question options in ascending order by the option letter property
export class OptionSortPipe implements PipeTransform {

  transform(value: Option[]): Option[] {
    

    if(value){

      return value.sort((opt1:Option, opt2:Option) =>{

        if(opt1.letter < opt2.letter) return -1;

        else if(opt1.letter > opt2.letter ) return 1;

        return 1;
      })

     
    }

    return [];
  }

}
