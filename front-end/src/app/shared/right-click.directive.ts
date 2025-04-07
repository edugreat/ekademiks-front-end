import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

// emits true when the directive to which this custom directive is right clicked
@Directive({
    selector: '[appRightClick]',
    standalone: true,
})
export class RightClickDirective {

  @Output() rightClick = new EventEmitter<boolean>();

  constructor() { }

  @HostListener('contextmenu',['$event'])
  onRightClick(event:MouseEvent):void{

    event.preventDefault();
    this.rightClick.emit(true) //emits true once the directive is right-clicked
  }

}
