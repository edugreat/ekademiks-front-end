import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AdminService } from './admin.service';
import { Subscription, timeout } from 'rxjs';
import { MatStepper, MatStep, MatStepLabel } from '@angular/material/stepper';
import { NgIf } from '@angular/common';
import { MatAnchor } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css',
    standalone: true,
    imports: [
        NgIf,
        MatStepper,
        MatStep,
        MatStepLabel,
        MatAnchor,
        MatMenuTrigger,
        MatIcon,
        MatMenu,
        MatMenuItem,
        RouterOutlet,
    ],
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  //acivated route parameter
  parameter: string | null | undefined;

  //any of the actions the admin wants to perform, instantiated from the view page
  action = '';

  // A variable showing the milestone reached in completing a task at hand.
  // Task cam be uploading of assessment or result.
  // This is intended for use in setting up mat-stepper component
  milestone = 0;

  // A variable indicating decription for the task at hand
  description:string|undefined;

  // Used to subscribe an unsubscribe to milestone event
  milestoneSub?:Subscription;

  // subscribes and unsubscribes to task description event
  taskDescriptionSub?:Subscription;

  // Get handle to the mat-stepper directive 
  @ViewChild('stepper') stepper?:MatStepper;

  // Number of steps of a mat stepper corresponding to te number of tasks to complete
  private numberOfSteps = 0

  // checks if the whole tasks have been completed
  taskCompleted = false;

  // timeout that resets the stepper directive once the task is complete
  stepperResetTimeout:any;


  constructor(private activatedRoute: ActivatedRoute, private router: Router, private adminService:AdminService) {}
  
  
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(
      (params) => {

        
        (this.parameter = params.get('parameter'))
      
      }
    );

    this.trackTaskDescription();
    this.trackMilestone();
    clearTimeout(this.stepperResetTimeout);

    if(this.description){

      
    }
   
  }

  ngAfterViewInit(): void {
  
    if(this.stepper){
      this.numberOfSteps = this.stepper!.steps.length;

   
    }
    

    
  }

  ngOnDestroy(): void {

   
   this.taskDescriptionSub?.unsubscribe();
   this.milestoneSub?.unsubscribe();
   this.adminService.setTaskMilestone(0);
  }


  process() {
    //redirect admin to the particular page based upon the action they want to perform
    this.router.navigate([this.action], { relativeTo: this.activatedRoute });
  }

  // Track task completion milestone
  private trackMilestone(){

    // then start tracking the task's milestone
 
    this.milestoneSub = this.adminService.taskMilestoneObs$.subscribe(milestone => {
     

      if(this.description){

        
      this.milestone = milestone;
     
      // Moves to the next step once the current step has been completed, also check against array index out of bounds error
      if(this.milestone > 0 && this.stepper!.selectedIndex < this.numberOfSteps - 1){

        // Mark as completed the task for that milestone. steppers are zero base indexed
        this.stepper!.steps.get(milestone - 1)!.completed = true
      this.stepper?.next();

      //  Task is completed once the milestone is the number of tasks at hand
      }if(this.numberOfSteps - milestone - 1 === 0) {
       
        // reset the stepper after some timeout 
        this.stepperResetTimeout =setTimeout(() => {
        
          this.stepper?.reset();
        this.adminService.resetMilestone();
        this.adminService.taskDescription('');
        
        // route back the user to the admin page for more uploads 
        this.router.navigate(['/admin/upload'])
        }, 10000);
       
      }
      }
    });

   
 

  }

  // Tracks description of the task at hand
  private trackTaskDescription(){

    this.taskDescriptionSub = this.adminService.taskObs$.subscribe(description =>{ 
    
      this.description = description;
    
    })


  }

 
 
  }

  

