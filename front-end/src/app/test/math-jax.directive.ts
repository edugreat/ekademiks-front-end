import { Directive, ElementRef, Input, OnChanges, SimpleChanges, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare const MathJax:any;

@Directive({
  selector: '[appMathJax]'
})
export class MathJaxDirective implements OnChanges{

  @Input() appMathJax = '';
  constructor(private el: ElementRef,
    private sanitizer:DomSanitizer
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    
    if(changes['appMathJax']){

      const sanitizedContent: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.appMathJax);
      this.el.nativeElement.innerHTML = sanitizedContent as string;
      this.el.nativeElement.innerHTML = this.appMathJax;
      MathJax.typesetPromise([this.el.nativeElement]);
      
    }
  }

}
