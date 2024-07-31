import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumeric]'
})
//Directive that rejects non numeric input, especially useful in a mobile contact input field
export class NumericDirective {

  constructor(private el: ElementRef) { }

  

  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent){

    const key:string = event.key; //the current key string the user just pressed
    
    const targetEl: HTMLElement = this.el.nativeElement; //the target element on which the event(keypress) occured
    
   if(isNaN(Number(key))){

    event.preventDefault();
    targetEl.classList.add('invalid-phone-number')
   }else{

    targetEl.classList.remove('invalid-phone-number')
   }

    
  }

}
