import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  
})
export class SortPipe implements PipeTransform {

  transform(value: any[] | null):string[] {

    if(value){

      return value.sort((a:string, b:string) => {

        if(a < b){
          
          return -1;
        }else if(a > b){

         
          return 1;
        } return 0;

      })
    }

    return [];
  }

}
