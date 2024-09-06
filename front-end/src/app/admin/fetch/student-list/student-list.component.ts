
type pageInfo = {
  pageSize:number,
  totalElements:number,
  totalPages:number,
  currentPage:number

}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, Student, StudentInfo } from '../../admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})

// component that handles rendering of students list as received from the server
export class StudentListComponent implements OnInit, OnDestroy{





  // pagination information returned from the server
  pagination?:pageInfo;


  // default page size
  DEFAULT_PAGE_SIZE = 1;
  // an array of empty students
  students:Student[] = [];

  // used to unsubscribe from the service that fetches students information
  private studentInfoSub?:Subscription;

  selectedStudent: Student|undefined;



  constructor(private adminService:AdminService){


  }
  ngOnInit(): void {
    this.fetchStudentsInfo();
  }
  ngOnDestroy(): void {
  this.studentInfoSub?.unsubscribe()
  }


  // Calls the service implementation to fetch students list
  private fetchStudentsInfo(page_number?:number){

    this.studentInfoSub = this.adminService.fetchStudentList(page_number || 0,  this.DEFAULT_PAGE_SIZE).subscribe({

      next:(studentsInfo) =>{
        

     this.students =  studentsInfo._embedded.students.map(student =>({

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
    
      
      }
    })


  }

  // set the selectedStudent property to the student at the given index
  details(index: number) {
   
    this.selectedStudent = this.students[index];
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

    // takes the user to back to the webpage they were previously on
    goBack() {
      
      window.history.back();
      }

}
