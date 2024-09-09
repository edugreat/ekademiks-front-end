import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService, Student, StudentPerformance, StudentPerformanceInfo } from '../../../admin.service';
import { Subscription } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ArcElement, Chart, Legend, registerables, Tooltip } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-student-details-page',
  templateUrl: './student-details-page.component.html',
  styleUrl: './student-details-page.component.css'
})
export class StudentDetailsPageComponent implements OnInit, AfterViewInit, OnDestroy{
  
  
  

  studentPerformanceSub?:Subscription;


  // The mean assessment score a student
  averageAssessmentScore = 0;

  // An array of student performances in all the assessments taken
  studentPerformances:StudentPerformance[] = [];

  // An array containing names (title) of all the assessments the student has taken
  assessmentNames:string[] = [];
  
  // chart to show student performance analysis
 public performanceChart: Chart<'pie'>|null = null;
    

  constructor(private adminService:AdminService, private activatedRoute:ActivatedRoute){}


  ngOnInit(): void {

    

    this.activatedRoute.paramMap.subscribe(params =>{

      this.performanceChart?.destroy();

      const studentId:number = Number(params.get('id'));

      if(studentId){

        this.getPerformanceInfo(studentId);
        
      }

      
    })

   
  }

  ngOnDestroy(): void {
    
    this.studentPerformanceSub?.unsubscribe();
    this.performanceChart?.destroy();
  }

  ngAfterViewInit(): void {
    
    //this.renderPerformancePieChart();


  }

  // subscribes to the service to get student performance information
  getPerformanceInfo(studentId:number){

   

    this.studentPerformances = [];

   
    this.assessmentNames = [];
    

    this.studentPerformanceSub =  this.adminService.fetchStudentPerformanceInfo(studentId).subscribe({

      next:(performanceInfo:StudentPerformanceInfo) => {
      

      performanceInfo._embedded.StudentTests.forEach(performance => {

        const studentPerformance:StudentPerformance = {id:performance.id, score:performance.score, when:performance.when,grade:performance.grade};

        this.studentPerformances.push(studentPerformance);
        

        this.getAssessmentName(performance.id);

        
      })


      },
      complete:() => {

        this.computeAverageAssessmentScore()
      }
    })
   
  }

  private getAssessmentName(studentId:number){

    this.adminService.fetchAssessmentNames(studentId).subscribe({

      next:((result:{testName:string}) => {

      this.assessmentNames.push(result.testName);


      })
    })
  }

  private computeAverageAssessmentScore(){

    this.averageAssessmentScore = 0;

    this.studentPerformances.forEach(performance => {

     
      
      this.averageAssessmentScore += performance.score;
    });


     this.averageAssessmentScore /= this.studentPerformances.length;
     this.averageAssessmentScore *= 10;

     this.renderPerformancePieChart()

     
  }

  // Method the renders performance pie chart for analytics purpose
  private renderPerformancePieChart() {  

    this.performanceChart?.destroy();
    
    // First ensure the student has taken at least an assessment
    if(this.studentPerformances.length){

       // Create the chart instance and store it  
       this.performanceChart = new Chart("analysisChart", {  
        type: 'pie',  
        data: {  
            labels: this.assessmentNames,  
            datasets: [{  
                label: 'Performance Degree',  
                data: this.studentPerformances.map(p => p.score),  
                backgroundColor:this.generateRandomColorFor(this.studentPerformances.length),  
                // borderColor: [  
                //     'rgba(75, 192, 192, 1)',  
                //     'rgba(255, 99, 132, 1)',  
                //     'rgba(255, 206, 86, 1)'  
                // ],  
                borderWidth: 1  
            }]  
        },  
        options: {  
            responsive: true,  
            plugins: {  
                legend: {  
                    position: 'top',  
                },  
                title: {  
                    display: true,  
                    text: 'Performance Analytics'  
                }  
            }  
        }  
    });  
    }
    
    

          
        } 

        // Generate random hex color used as background colors for the different pie segment. 
        // This is important since the data fed into the pie is a dynamic one
        private  generateRandomColorFor(dataSize:number):string[]{

          let hexColors:string [] = [];
          // Used to construct hex color
          const letter = '0123456789ABCDEF';
          for (let index = 0; index < dataSize; index++) {
            let color = '#';
            for (let i = 0; i < 6; i++) {
              color += letter[Math.floor(Math.random() * 16)];
              
            }

            hexColors.push(color);
            
          }

          return hexColors;


        }
    } 

