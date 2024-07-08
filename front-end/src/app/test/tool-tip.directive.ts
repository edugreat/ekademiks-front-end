import { Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

declare const MathJax:any;

@Directive({
  selector: '[appToolTip]'
})

// Directive that uses MathJax to render latex formatted text to math format.
// This is used to provide well parsed text tooltip to students as they hovered on their assessment report 
export class ToolTipDirective implements OnChanges{
  @Input() appToolTip:string = '';

  @Output() parsedTooltip = new EventEmitter<string>();


  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    if(changes['appToolTip']){

      this.el.nativeElement.innerHTML = this.appToolTip;
      MathJax.typesetPromise([this.el.nativeElement]).then(() =>{

        const mathJaxContent = this.el.nativeElement.innerHTML;
        this.el.nativeElement.innerHTML = '';//clear the content to hide it
        
        //emits parsed text
        this.parsedTooltip.emit(mathJaxContent);
        
      });
    }
  }

}
