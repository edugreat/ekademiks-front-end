import { Component, Input, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { NotificationsComponent } from '../notifications/notifications.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';

// This component is the assessment instructions guides which the student taking the assessment is expected to adhere to
@Component({
    selector: 'app-instructions',
    templateUrl: './instructions.component.html',
    styleUrl: './instructions.component.css',
    standalone: true,
    imports: [NgIf, NotificationsComponent, MatButton, MatIcon, FormsModule, ReactiveFormsModule, NgFor, MatFormField, MatInput, MatTooltip]
})
export class InstructionsComponent implements OnInit{



  // declare the instruction form
  instructionForm?:FormGroup;

  // signals form error
  hasError = true;

  // The id of the assessment (just uploaded) whose instructional guide is to be set and uploaded
  @Input()
   uploadedAssessmentId?:number;
  
  //  The 'type' field represents the type of task currently on process
  // Since the InstructionsComponent is the last stage of the test upload task,
  // The 'taskType' is set to 'assessment upload' which is forwarded to the server via notification endpoint
    taskType = 'upload';

  //  Determines if instructional guides for the assessment has successfully been uploaded
  // When set to true, then the admin can proceed with sending notifications
   hasUploadedInstructions = false;


  constructor(private adminService:AdminService, private fb:FormBuilder
  ){

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

   

    this.adminService.uploadInstructions(this.instructionForm?.value, this.uploadedAssessmentId!).subscribe((status:HttpStatusCode) =>{

      // set task's milestone to 2 if upload was successful
      if(status = HttpStatusCode.Ok){
        this.adminService.setTaskMilestone(2);
        
        // sets the boolean flag to true so admin can proceed with sending notificationa
        this.hasUploadedInstructions = true;

       
      }
    
    })
    
    }
}
