import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PerformanceObject } from '../../test.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-performance-report',
  templateUrl: './performance-report.component.html',
  styleUrl: './performance-report.component.css'
})
export class PerformanceReportComponent implements OnInit, OnDestroy, AfterViewInit{




  details? : Details; //details of the particular assessment the student want to view when going through their performance report

  sciences = ['Physics','Mathematics','Chemistry','Biology', 'Economics', 'Basic science', 'Basic tech']//for the subjects given here, when the student clicks on the visibility icon, they should be taken to the assessment detail page

  //students's performance input received from thee parent component, PerformanceComponent
  @Input() performance:PerformanceObject|undefined;

  testTip?:{problem:string, response:string, answer:string}[]; //used to provide tips to students during assessment report, for the questions they attempted and their correct options 
    
  

  displayedColumns: string[] = ['questionNumber', 'selectedOption', 'correctOption', 'remark'];
  totalQuestions?:number;
  correctOptions?:number;
  percentScore?:number;
  grade?:string;

 //mat table datasource
  dataSource!:MatTableDataSource<AssessmentSummary>;

  @ViewChild(MatPaginator) paginator!:MatPaginator; //get a handle to the paginator directive



  pageIndex = 0; //current page index

  pageSize = 5; //number of items per page

display? :boolean[];
//dynamic property that shows if the student want to sign out or take more test.
//It is controlled by the student's interraction witht the raadio button
signoutOrMore = '';


constructor(private router:Router, private authService:AuthService,
  private confirmationService:ConfirmationDialogService
){}
  ngOnInit(): void {

    this.performanceAnalysis();
   
  }

  ngAfterViewInit(): void {
    if(this.performance){
      this.dataSource.paginator = this.paginator;
    }
  }


  ngOnDestroy(): void {

    //sessionStorage.removeItem('testTip');
    this.performance = undefined;
   
    
  }
  
 
//analysis for the student's performance
private performanceAnalysis(){

  if(this.performance){

    this.totalQuestions = this.performance.selectedOptions.length;

  

  //filters all the student's selected options that match the correct options, then get the total.
  this.correctOptions = this.performance?.selectedOptions.filter((option, index)=> option === this.performance?.correctOptions[index]).length;

  //computes student's percentage score
  this.percentScore = Math.floor((this.correctOptions!/this.totalQuestions!)*100);


  this.grade = this.computeGrade(this.percentScore);

  const summary:AssessmentSummary[] = this.performance!.selectedOptions.map((option, index) => ({
   questionNumber:index+1,
   selectedOption:option,
   correctOption:this.performance!.correctOptions[(this.pageIndex * this.pageSize)+index],
   remark: option === this.performance!.correctOptions[(this.pageIndex * this.pageSize)+index]
    

  }))

  this.display = new Array(summary.length).fill(false);//intialize each element of the array to false just to initially set visibility to off in the view
  
  this.dataSource = new MatTableDataSource(summary);
  this.testTip = JSON.parse(sessionStorage.getItem('testTip')!);


  }

  
 

}

toolTipFor(index:number, option:string): string{

  switch (option) {
    case 'problem':

    return this.testTip![index].problem
      
     case 'response':
      return this.testTip![index].response;
  

      case 'answer':
        return this.testTip![index].answer;
    
  }

  return '';
}

//computes the student's grade with the provided method argument
private computeGrade(percentScore:number):string{

  if(percentScore >= 70){
    return 'A';
  }else if(percentScore >= 60){

    return 'B';
  }else if(percentScore >= 50){
    
    return 'C';
  }else if(percentScore >= 45){

    return 'D';
  } else if(percentScore >= 40){

    return 'E';
  }

  return 'F';

}


//method that updates the view when a new page is viewed
onPageChange(page: PageEvent) {

  this.pageIndex = page.pageIndex;
  
  }

isScience(){

  const science = this.sciences.some((subject) => subject.substring(0,4) === this.performance?.subjectName.substring(0,4));
 
  return science
}

//method that displays the details of assessment, tracked by their question numbers
goToDetails(_index:number) {

 

  if(!this.display![_index]){

    const sample = this.testTip![_index];
  
  const details:Details = {

    number:_index+1,
    problem:sample.problem,
    response:sample.response,
    answer:sample.answer
  }

  this.details = details;
  this.display![_index] = !this.display![_index];

  //toggle off anyother visible icon
  const indexToToggleOff = this.display!.findIndex((value, index) => index !== _index && value);
  

  if(indexToToggleOff >= 0){
    
    this.display![indexToToggleOff] = false;
  }
  }
  
  else {

    this.display![_index] = !this.display![_index];
    this.details = undefined;
  }
  
  }

  //handles students interraction with the radio button to decide if they should sign out or take more tests
  moreOrSignout() {

    if(!this.isLoggedIn()){
     
      this.router.navigate(['/home/true']);
    }
    else{ //for logged in users
      if(this.signoutOrMore === 'More'){
        this.router.navigate(['/home/true']);
      }else if(this.signoutOrMore === 'Out'){


        this.confirmationService.confirmAction('Do you want to logout?');
        this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe((yes) =>{

          if(yes){
        this.authService.logout();
       
        this.router.navigate(['/login']);
          }else{//if user decides to not sign out again, uncheck previous check
            this.signoutOrMore = '';//uncheck previous check
          }
        })

        
      }
    }

    
    }


    isLoggedIn(): boolean {
      
      return this.authService.isLoggedIn();
      }
}

export interface AssessmentSummary{

  questionNumber:number,
  selectedOption:string|null,
  correctOption:string,
  remark:boolean
}

export interface Details {

  number:number,
  problem:string,
  response:string,
  answer:string

}
