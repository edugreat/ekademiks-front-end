import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// This component is the assessment instructions guides which the student taking the assessment is expected to adhere to
@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrl: './instructions.component.css'
})
export class InstructionsComponent implements OnInit{



  // declare the instruction form
  instructionForm?:FormGroup;

  // signals form error
  hasError = true;


  constructor(private adminService:AdminService, private fb:FormBuilder){

  }
  
  ngOnInit(): void {

    this.instructionForm = this.fb.group({

      instructions:this.fb.array([this.formControl()]),
    })

    this.formArray.valueChanges.subscribe(() => this.processFormForErrors());
    
    
   
  }


  // Always return a new form control
  private formControl():FormControl{

    return new FormControl('',[Validators.required]);

    
  }

  // returns the form array
  get formArray():FormArray{


    return this.instructionForm?.get('instructions') as FormArray;
  }
  
  // Dynamically adds new form to the form array
  addInstruction(){

    this.formArray.push(this.formControl());

  }

  // Always deletes a form group at a the index of the form array
  deletInstruction(index:number){

    this.formArray.removeAt(index);
  }

  // checks if the form has errors
  private processFormForErrors(){

    const formSize = this.formArray.length;
    // if form array is empty, return true so upload button can be disabled
    if(!formSize) this.hasError = true;
    
   else{
    for (let index = 0; index < formSize; index++) {
      
      const formControl = this.formArray.at(index) as FormControl;
     
      if(!formControl.hasError('required')) this.hasError = false;

      else this.hasError = true
     
    } 
   }

    
  }

  // Uploads instructions for the test
  upload() {

   

    this.adminService.setInstruction(this.instructionForm?.value).subscribe(value =>{
    
    })
    
    }
}
