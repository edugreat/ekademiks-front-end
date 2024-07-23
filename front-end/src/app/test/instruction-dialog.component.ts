import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-instruction-dialog',
  templateUrl: './instruction-dialog.component.html',
  styleUrl: './instruction-dialog.component.css'
})

//Component provides dialog box that displays instructions students must adhere to while taking the test assessment
export class InstructionDialogComponent implements OnInit{

  //inject the MAT_DIALOG_DATA so the dialog can receive the instructions passed to its 'data' property
  constructor(@Inject(MAT_DIALOG_DATA) public data:{instructions: string[]}){}


  ngOnInit(): void {
    
  }

  

}
