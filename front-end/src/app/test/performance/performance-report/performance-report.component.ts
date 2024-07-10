import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PerformanceObject } from '../../test/test.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-performance-report',
  templateUrl: './performance-report.component.html',
  styleUrl: './performance-report.component.css'
})
export class PerformanceReportComponent implements OnInit, OnDestroy, AfterViewInit{


  //students's performance input received from thee parent component
  @Input() performance:PerformanceObject|undefined;

  testTip?:{problem:string, response:string, answer:string}[]; //used to provide tips to students during assessment report, for the questions they attempted and their correct options 
    
  //parsed object
  parsedTooltip:{problem:string, response:string, answer:string}[] = [{problem:'', response:'',answer:''}];

  displayedColumns: string[] = ['questionNumber', 'selectedOption', 'correctOption', 'remark'];
  totalQuestions?:number;
  correctOptions?:number;
  percentScore?:number;
  grade?:string;

 //mat table datasource
  dataSource!:MatTableDataSource<AssessmentSummary>;

  @ViewChild(MatPaginator) paginator!:MatPaginator; //get a handle to the paginator directive
display:boolean[] = [];

  ngOnInit(): void {

    this.performanceAnalysis();
   
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  ngOnDestroy(): void {

    sessionStorage.removeItem('testTip');
    this.parsedTooltip =[];
    
  }
  
 
//analysis for the student's performance
private performanceAnalysis(){

  if(this.performance){

    this.totalQuestions = this.performance.selectedOptions.length;

    for (let index = 0; index < this.totalQuestions; index++) {
      this.display[index] = false; //initialize to false 
      
    }


  //filters all the student's selected options that match the correct options, then get the total.
  this.correctOptions = this.performance?.selectedOptions.filter((option, index)=> option === this.performance?.correctOptions[index]).length;

  //computes student's percentage score
  this.percentScore = Math.floor((this.correctOptions!/this.totalQuestions!)*100);


  this.grade = this.computeGrade(this.percentScore);

  const summary:AssessmentSummary[] = this.performance!.selectedOptions.map((option, index) => ({
   questionNumber:index+1,
   selectedOption:option,
   correctOption:this.performance!.correctOptions[index],
   remark: option === this.performance!.correctOptions[index]
    

  }))

  this.dataSource = new MatTableDataSource(summary);
  this.testTip = JSON.parse(sessionStorage.getItem('testTip')!);


  }

  
 

}

getToolTipFor(index:number, option:string):string{

  if(this.testTip && this.testTip[index]){

    switch(option){

      case 'problem': return this.testTip[index].problem;

      case 'answer': return this.testTip[index].answer;

      case 'response': return this.testTip[index].response
    }
  }
  
  return '';
}

onTooltipParsed(index:number, option:string, parsedValue:string){

 
if(! this.parsedTooltip){
  this.parsedTooltip = [{problem:'', answer:'', response:''}];
  this.setParsedValue(index, option, parsedValue);
 

}else if(! this.parsedTooltip[index]){
this.parsedTooltip[index] = {problem:'', answer:'', response:''};
this.setParsedValue(index, option, parsedValue);


}else{
  this.setParsedValue(index, option, parsedValue);
}

}



  private setParsedValue(index: number, option: string, parsedValue:string) {
    switch (option) {
      case 'problem':
        this.parsedTooltip![index].problem = parsedValue;
        
        break;
      case 'answer':
        this.parsedTooltip![index].answer = parsedValue;
        
        break;
      case 'response':
        this.parsedTooltip![index].response = parsedValue;
        
        break;
    }
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

toggleShow(index:number) {
  this.display[index] = !this.display[index];
  
}
}

export interface AssessmentSummary{

  questionNumber:number,
  selectedOption:string|null,
  correctOption:string,
  remark:boolean
}
