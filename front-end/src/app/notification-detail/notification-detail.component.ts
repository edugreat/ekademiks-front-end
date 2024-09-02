import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Notification, NotificationsService } from '../admin/upload/notifications/notifications.service';
import { TestService } from '../test/test.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssessmentsService, TopicAndDuration } from '../assessment/assessments.service';


@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrl: './notification-detail.component.css'
})
export class NotificationDetailComponent implements OnInit, OnDestroy{


  // unread notifications initialized to an empty array
  unreadNotifications?:Notification[];


  // this is used to unsubscribe from the event that retrieves the assessment topic and duration
  private topicAndDurationSub$?:Subscription;

  constructor(private notificationService:NotificationsService, private testService:TestService,
    private router:Router, private assessmentService:AssessmentsService

  ){

   
  }
  
  ngOnInit(): void {

    this.getNotifications();
    
  }
  ngOnDestroy(): void {
    
    this.topicAndDurationSub$?.unsubscribe();
  }


  private getNotifications(){

    this.notificationService.unreadNotifications$.subscribe(notifications =>{

      this.unreadNotifications = notifications;
    
    })
  }

  // Extracts 'testId' and fetches assessment information using it
  processSelection(id:number) {

    // Basic asssessment information(subject name, category, topic and duration)
  let category = '';
  let subjectName = '';
  let topic = '';
  let duration = 0;
   
    // Get information about the subject name and category for the given testId.
    // Server call returns a map object(where key is subject name & value is category name)
   this.testService.subjectAndCategory(id).subscribe({
    next:(response:HttpResponse<{[key:string]:string}>) =>{

      
      const mapValue = response.body;
    if(mapValue){


  //  extractthe subject name as the key of mapValue
    subjectName = Object.keys(mapValue)[0]
// extract the category as the value of mapValue using the key(subjectName) property
    category = mapValue[subjectName];

    }

    },
   complete:() => this.getTopicAndDuration(id, topic, duration,subjectName,category)
   })
    }

    // gets the assessment topic and its duration
    private getTopicAndDuration(testId:number, topic:string, duration:number, subjectName:string, category:string){
    
      this.topicAndDurationSub$ = this.assessmentService.getTopicAndDuration(testId).subscribe({
   
        next:(result) =>{

          
          topic = result.topic;
          duration = result.duration;
         
         
        },

        // routes to assessment commencement page
        complete:() => this.router.navigate(['/start', topic, duration, subjectName, category])
      
      })

    }
}
