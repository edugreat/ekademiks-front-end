
type pageInfo = {
  pageSize:number,
  totalElements:number,
  totalPages:number,
  currentPage:number

}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, Student } from '../../admin.service';
import { Subscription } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/form-field';

@Component({
    selector: 'app-student-list',
    templateUrl: './student-list.component.html',
    styleUrl: './student-list.component.css',
    standalone: true,
    imports: [NgIf, NgFor, MatButton, MatIcon, MatSuffix, MatAnchor, RouterOutlet]
})

// component that handles rendering of students list as received from the server
export class StudentListComponent implements OnInit, OnDestroy{




  // used to check when data fetching has completed
  loading = true;

  // pagination information returned from the server
  pagination?:pageInfo;


  // default page size
  DEFAULT_PAGE_SIZE = 2;
  // an array of empty students
  students:Student[] = [];

  // used to unsubscribe from the service that fetches students information
  private studentInfoSub?:Subscription;

  



  constructor(private adminService:AdminService, private router:Router,
    private confirmation:ConfirmationDialogService){


  }
  ngOnInit(): void {
    this.fetchStudentsInfo();

    
  }
  ngOnDestroy(): void {
  this.studentInfoSub?.unsubscribe()
  }


  // Calls the service implementation to fetch students list
  private fetchStudentsInfo(page_number?:number){

    this.loading = true;

    this.studentInfoSub = this.adminService.fetchStudentList(page_number || 0,  this.DEFAULT_PAGE_SIZE).subscribe({

      next:(studentsInfo) =>{
        

     this.students =  studentsInfo._embedded.students.map(student =>({

      id:student.id,
      firstName:student.firstName,
      lastName:student.lastName,
      email:student.email,
      mobileNumber:student.mobileNumber,
      accountCreationDate:student.accountCreationDate,
      accountEnabled:student.accountEnabled,
      lockedAccount:student.lockedAccount
     }));

  

    this.pagination = {

      pageSize:studentsInfo.page.size,
      totalElements:studentsInfo.page.totalElements,
      currentPage:studentsInfo.page.number,
      totalPages:studentsInfo.page.totalPages

    }
    this.loading = !this.loading;
      
      }
    })


  }


// go to next page
nextPage() {
  
 
  // unsubscribe from previous subscription
  this.studentInfoSub?.unsubscribe();

  this.fetchStudentsInfo(this.pagination!.currentPage + 1)
  }
    
  // go to the previous page
  previousPage() {
    
    // unsubscribes from previous subscription
    this.studentInfoSub?.unsubscribe();

    this.fetchStudentsInfo(this.pagination!.currentPage - 1)
    }

    // Delete student's account
    deleteAccount(studentId: number) {
      
      // Asks admin to confirm the impending action
      this.confirmation.confirmAction('Do you really want to delete this account?');

      // Gets admin's response
      this.confirmation.userConfirmationResponse$.subscribe(response =>{

        // Go ahead with deleting the account if admin has consented to the deletion
        if(response){

          this.adminService.deleteStudent(studentId).subscribe({
            next:(response:HttpResponse<number>) => {

              if(response.status === HttpStatusCode.Ok){

                // reloads the current page after a successful deletion of the student's account
                window.location.reload();
              }
            },

            error:(err) => {
            
            
              this.router.navigate(['/error', err.error])
            }
          })


        }
      })


      }

      // Disables student's account
      disableAccount(studentId: number) {

        // Ask admin to confirm their action
        this.confirmation.confirmAction('Please confirm account disable action ?');

         // Gets admin's response
      this.confirmation.userConfirmationResponse$.subscribe(response => {

        // Go ahead with disabling the account if admin has consented to the action
        if(response){

          this.adminService.disableStudentAccount(studentId).subscribe({
            next:(response:HttpResponse<number>) => {

              if(response.status === HttpStatusCode.Ok){

                // reloads the current page after a successful disabling of the student's account
                window.location.reload();
              }
            },

            error:(err) => {
            
            
              this.router.navigate(['/error', err.error])
            }
          })


        }
      })

       
      }

      // Enables student's account
      enableAccount(studentId: number) {
       

         // Ask admin to confirm their action
         this.confirmation.confirmAction('Enable this account ?');

         // Gets admin's response
      this.confirmation.userConfirmationResponse$.subscribe(response => {

        // Go ahead with enabling the account if admin has consented to the action
        if(response){

          this.adminService.enableStudentAccount(studentId).subscribe({
            next:(response:HttpResponse<number>) => {

              if(response.status === HttpStatusCode.Ok){

                // reloads the current page after successfully enabling the student's account
                window.location.reload();
              }
            },

            error:(err) => {
            
            
              this.router.navigate(['/error', err.error])
            }
          })


        }
      })


        
      }

    // takes the user to back to the webpage they were previously on
    goBack() {
      
      window.history.back();
      }


      // Routes to the student's performance details page
      goToPerformanceDetails(id: number) {
        
        this.router.navigate(['students-list',id])

        }

}
