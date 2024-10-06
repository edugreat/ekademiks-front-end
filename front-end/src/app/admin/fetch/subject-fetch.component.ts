import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-subject-fetch',
  templateUrl: './subject-fetch.component.html',
  styleUrl: './subject-fetch.component.css'
})
export class SubjectFetchComponent implements OnInit, OnDestroy, AfterViewInit{



  displayedColumns: string[] = ['category', 'subject', 'edit', 'delete']; 

  totalElements = 0;
  pageSize = 5;
  currentPage = 0;

  dataSource!: MatTableDataSource<{category:string, subject:string}>;

  @ViewChild(MatPaginator) paginator!:MatPaginator;

onPageChange($event: PageEvent) {
throw new Error('Method not implemented.');
}



  constructor(private adminService:AdminService, private router:Router){}
 
  ngOnInit(): void {
   
    this.getAssessmentSubjects();
  }
  ngOnDestroy(): void {
   
  }
  ngAfterViewInit(): void {
    if(this.dataSource){
      this.dataSource.paginator = this.paginator;
    }
  }


private getAssessmentSubjects(){

  this.adminService.assessmentSubjects().subscribe({
    next:(data:AssessmentSubject) => {

      const subjectArray = this.transformToArray(data);

      this.totalElements = subjectArray.length;

      this.dataSource = new MatTableDataSource(subjectArray);
      
      this.dataSource.paginator = this.paginator;
    },

    error:(err) => this.router.navigate(['/error', err.error]),
    
  })
}

// Flattens the key-value data object to an array of objects suitable for assigning to a data source 
private transformToArray(data:AssessmentSubject):Array<{category:string, subject:string}>{

  let subjectArray:Array<{category:string, subject:string}> = [];
  for (const  category in data) {
   if(data.hasOwnProperty(category)){

    const subjects = data[category];
    subjects.forEach(subject => {

      subjectArray.push({category:category, subject:subject});
    })

   }
    
  }

  return subjectArray;
}



editSubject(arg0: any) {
  throw new Error('Method not implemented.');
  }
  deleteSubject(arg0: any) {
  throw new Error('Method not implemented.');
  }
  looksGood() {
  throw new Error('Method not implemented.');
  }
}

// A key-value pair representing assessment subject subjects where the key is the category the subject belongs to, and value is the subject name
type AssessmentSubject = {

  [key:string]:Array<string>
}
