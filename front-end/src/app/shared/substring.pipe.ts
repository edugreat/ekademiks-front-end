import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substring'
})
export class SubstringPipe implements PipeTransform {

  transform(value: string, start: number, end?:number): string {
    if(value){

      return value.substring(start, end);


    }

    return '';
  }

}
