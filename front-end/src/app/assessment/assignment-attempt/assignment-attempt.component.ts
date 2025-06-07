import { Component, OnInit } from '@angular/core';
import { AssignmentDetails, AssignmentService } from '../../admin/assignment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { catchError, of, take, timeout } from 'rxjs';
import { NgIf, DatePipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-assignment-attempt',
    templateUrl: './assignment-attempt.component.html',
    styleUrl: './assignment-attempt.component.css',
    standalone: true,
    imports: [NgIf, MatDivider, MatButton, MatProgressSpinner, DatePipe]
})
// component renders a particular assignment based on user selection
export class AssignmentAttemptComponent implements OnInit {


  // property representing details of a given assigment the student wishes to attempt
  assignmentDetails?:AssignmentDetails;

  // currently logged user of the app(a student who wishes to attempt an assignment)
  private _currentUser?:User;

  
  // attempt to retrieve assignment details for 10 seconds before giving up
  timeout = false;

  // route param for the ID of assignment the student wishes to attempt
  private assignmentDetailsId:string|null = null;

  constructor(private assignmentService:AssignmentService, private activatedRoute: ActivatedRoute,
    private authService:AuthService
  ){}
  
  ngOnInit(): void {
   
    this.activatedRoute.paramMap.subscribe(params => {

      this.assignmentDetailsId = params.get('id');

      if(this.assignmentDetailsId){

       

        // subscribe to get information about the currently logged in student, then pull details about the assignment
        this.currentUser();
      }
    })


  }

  private currentUser(){

    this.authService.loggedInUserObs$.pipe(take(1)).subscribe( user => {

      if(user){
        this._currentUser = user;

        this.getAssignmentDetails(this.assignmentDetailsId!);
      }
    })
  }

  private getAssignmentDetails(assignmentId: string){

    this.assignmentService.getAssignmentDetails(Number(assignmentId)).pipe(
      take(1),
      timeout(10000),// 10 seconds timeout
      catchError((err) => {
        
        this.timeout = true;
        return of(null);
      })
      
    
    ).subscribe({

      next:(details: AssignmentDetails | null) => {
        if (details) {
          this.assignmentDetails = details;
        }
      },

      complete:() => {
        
        // TODO: Mark this assignment as being read by the student
      }
    })



  }


takeAssignment() {

  this.assignmentService.getAssignmentResources(this.assignmentDetailsId!).pipe(take(1)).subscribe({
    
    next:(resources) => {

      
    },

    error:(err) => console.log(`error: ${err.error}`),

    complete:() => console.log('completed')
  })

  
}
takeLater() {
throw new Error('Method not implemented.');
}

}
