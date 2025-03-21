import { Component, OnInit } from '@angular/core';
import { AssignmentDetails, AssignmentService } from '../../admin/assignment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-assignment-attempt',
  templateUrl: './assignment-attempt.component.html',
  styleUrl: './assignment-attempt.component.css'
})
// component renders a particular assignment based on user selection
export class AssignmentAttemptComponent implements OnInit {

  // property representing details of a given assigment the student wishes to attempt
  assignmentDetails?:AssignmentDetails;

  // currently logged user of the app(a student who wishes to attempt an assignment)
  private _currentUser?:User;

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

    this.assignmentService.getAssignmentDetails(Number(assignmentId)).pipe(take(1)).subscribe({

      next:(details:AssignmentDetails) => this.assignmentDetails = details,

      error:(err) => console.log(`error: ${err.error}`),

      complete:() => console.log(`${JSON.stringify(this.assignmentDetails, null, 1)}`)
    })



  }

}
