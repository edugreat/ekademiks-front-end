import { Directive, EventEmitter, HostListener, Output, Renderer2, ElementRef } from '@angular/core';

@Directive({
    selector: '[appDrag]',
    standalone: true
})
export class DragDirective {

  @Output() fileEmitter: EventEmitter<HTMLInputElement> = new EventEmitter();


  // emits warning message on file drop when the wrong file format is dropped
  @Output() warning: EventEmitter<string> = new EventEmitter();

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  @HostListener("dragover", ["$event"])
  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(this.el.nativeElement, 'background', '#999');
    this.renderer.setStyle(this.el.nativeElement, 'border-color', '#999');
  }

  @HostListener("dragleave", ["$event"])
  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(this.el.nativeElement, 'background', '#eee');
    this.renderer.setStyle(this.el.nativeElement, 'border-color', '#aaa');
  }

  @HostListener("drop", ["$event"])
  public onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(this.el.nativeElement, 'background', '#eee');
    this.renderer.setStyle(this.el.nativeElement, 'border-color', '#aaa');

    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      const file = files[0];

      // get file extension (eg PDF,docx etc)
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'pdf') {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', '#ff0000');
        this.warning.emit('Requires PDF file only');
       
        return;
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', '#aaa');
        this.warning.emit('')
        
      }

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      mockInput.multiple = true;

      Object.defineProperty(mockInput, 'files', {
        value: files,
        writable: false
      });

      this.fileEmitter.emit(mockInput);
    } 
  }
}