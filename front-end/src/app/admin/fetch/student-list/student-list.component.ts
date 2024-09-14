
type pageInfo = {
  pageSize:number,
  totalElements:number,
  totalPages:number,
  currentPage:number

}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, Student } from '../../admin.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
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
      accountCreationDate:student.accountCreationDate
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
      this.confirmation.userConfirmationResponse$.pipe(
       
      ).subscribe(response =>{

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

        // IMPLEMENTATION SOON .....
       
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
