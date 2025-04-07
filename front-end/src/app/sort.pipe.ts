import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sort',
    standalone: true,
})
export class SortPipe implements PipeTransform {

  transform(values: any[] | null):any[] {

    if(values){

      //if values has the 'topic' and 'duration' properties, then it is a 'TopicAndDuration' object
      if(values.every((value) => typeof value !== 'string' && ('topic' in value && 'duration' in value))){

        return values.sort((val1:any , val2: any) =>{

          if(val1.topic < val2.topic) return -1;
          else if(val1.topic > val2.topic) return 1
          else return 0;

        })


      }
      //checks if values is a string array type
      else if(values.every((value) => typeof value === 'string')){

        return values.sort((str1:string, str2:string) =>{

          if(str1 < str2) return -1;
          else if(str1 > str2) return 1;
          else return 0;
        })
      }
    }


    return [];
  }

}
