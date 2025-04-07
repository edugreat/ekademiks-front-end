import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


declare const MathJax:any;

@Directive({
    selector: '[appMathJax]',
    standalone: true
})
export class MathJaxDirective implements OnChanges{

  @Input() appMathJax:string = '';

  constructor(private el: ElementRef , private sanitizer: DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    if(changes['appMathJax']){

      this.el.nativeElement.innerHTML = this.appMathJax;
      MathJax.typesetPromise([this.el.nativeElement]);
    }
  }

}
