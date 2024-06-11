import { Pipe, PipeTransform } from '@angular/core';

// Transorms the time duration of the test in minutes and seconds with a zero padding if second portion is one-digit
@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {

  transform(value: number): string {
    
    if(value){

      const minute = Math.floor(value/60); //get the integer value of minute portion of the time left wihhout approximation
      const seconds = value % 60; //get the seconds portion of the time left

      return `${minute}:${seconds < 10 ? '0': ''}${seconds}`
    }

    return '';
  }

  
}
