import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from './admin.service';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
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
  taskDesriptionSub?:Subscription;

  // Get handle to the mat-stepper directive 
  @ViewChild('stepper') stepper?:MatStepper;

  // Number of steps of a mat stepper corresponding to te number of tasks to complete
  private numberOfSteps = 0

  // checks if the whole tasks have been completed
  taskCompleted = false;


  constructor(private activatedRoute: ActivatedRoute, private router: Router, private adminService:AdminService) {}
  
  
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(
      (params) => (this.parameter = params.get('parameter'))
    );

  
    
    this.trackTaskDescription();
    this.trackMilestone();
  }

  ngAfterViewInit(): void {
    this.stepper!.selectedIndex = 1;
    this.numberOfSteps = this.stepper!.steps.length;
   

    
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }


  process() {
    //redirect admin to the particular page based upon the action they want to perform
    this.router.navigate([this.action], { relativeTo: this.activatedRoute });
  }

  // Track task completion milestone
  private trackMilestone(){

    // If task description is established, then start tracking the task's milestone
  if(this.description){
    this.milestoneSub = this.adminService.taskMilestoneObs$.subscribe(milestone => {

      this.milestone = milestone;
      // Moves to the next step once the current step has been completed, also check against array index out of bounds error
      if(milestone > 0 && this.stepper!.selectedIndex < this.numberOfSteps - 1){
       this.stepper?.next();
      }if(this.numberOfSteps - milestone === 1) this.taskCompleted = true;
    });
  }

  }

  // Tracks description of the task at hand
  private trackTaskDescription(){

    this.taskDesriptionSub = this.adminService.taskObs$.subscribe(description => this.description = description)


  }

 
  }

  

