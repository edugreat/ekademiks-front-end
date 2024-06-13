

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent implements OnInit{

  @Input() deviceXs = false; //the size of the screen on which the component is initialized

  diameter = 2; //the diameter property of the spinner, to be redetermined by screen sizes
  
  ngOnInit(): void {
    this.changeSpinnerDiameter();

  }

  private changeSpinnerDiameter(){
    if(! this.deviceXs){

      this.diameter = 5;
    }else{
      this.diameter = 2;
    }
  }
}