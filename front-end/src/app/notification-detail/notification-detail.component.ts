import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { _Notification, NotificationsService } from '../admin/upload/notifications/notifications.service';
import { TestService } from '../test/test.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssessmentsService } from '../assessment/assessments.service';
import { AuthService, User } from '../auth/auth.service';
import { AssignmentService } from '../admin/assignment.service';
import { NgIf, NgFor, UpperCasePipe, DatePipe } from '@angular/common';


@Component({
    selector: 'app-notification-detail',
    templateUrl: './notification-detail.component.html',
    styleUrl: './notification-detail.component.css',
    standalone: true,
    imports: [NgIf, NgFor, UpperCasePipe, DatePipe]
})
export class NotificationDetailComponent implements OnInit, OnDestroy{

 private notificationService = inject(NotificationsService);
 private testService = inject(TestService);
 private router = inject(Router);
 private assessmentService = inject(AssessmentsService);
 private assignmentService = inject(AssignmentService);

  // subscribe to receive unread notifications
   unreadNotifications = signal(this.notificationService.unreadNotifications());

  private currentUser?:User;

  private currentUserSub?:Subscription;

 


  // this is used to unsubscribe from the event that retrieves the assessment topic and duration
  private topicAndDurationSub$?:Subscription;


  
  ngOnInit(): void {

  

   this.trackAssignmentsMarkedAsRead();
    
  }
  ngOnDestroy(): void {
    
    this.topicAndDurationSub$?.unsubscribe();

    this.currentUserSub?.unsubscribe();
  }

 

  

  // subscribes to the assignment service to be notified of assignments the user has read.
  // It receives the emitted information(ID) of the assignment, deletes it from the notification view. 
  private trackAssignmentsMarkedAsRead(){

    this.assignmentService.assignmentMarkedAsRead$.subscribe(assignmentId => {

      const index = this.unreadNotifications().findIndex(n => n.id === assignmentId);

      if(index >= 0){

        // get the notification ID
        const readNotificationId = this.unreadNotifications()[index].id;

        // filter out the just read notification
        const unread = this.notificationService.unreadNotifications().filter(n => n.id !== readNotificationId);
        
        // update the notification to just remove the just read notification
        this.notificationService.unreadNotifications.set(unread);

      }
    })


  }
  
  // Extracts 'metadata' and fetches assessment information using it, remove the current notification from the notifications array
  processSelection(metadata:number, index:number, notificationId:number) {

    switch (this.unreadNotifications()[index].type.toLowerCase()) {
      case 'assignment':
        
      // routes to the assignment attempt component if notification is that of assignment
      this.router.navigate(['assignment', metadata]);
        break;
    
      default:
      
    // Basic asssessment information(subject name, category, topic and duration)
  let category = '';
  let subjectName = '';
  let topic = '';
  let duration = 0;
   
    // Get information about the subject name and category for the given testId.
    // Server call returns a map object(where key is subject name & value is category name)
   this.testService.subjectAndCategory(metadata).subscribe({
    next:(response:HttpResponse<{[key:string]:string}>) =>{

      
      const mapValue = response.body;
    if(mapValue){


  //  extract the subject name as the key of mapValue
    subjectName = Object.keys(mapValue)[0]
// extract the category as the value of mapValue using the key(subjectName) property
    category = mapValue[subjectName];

    }

    },
   complete:() => {

    // remove the notification from the notification service
   const unreadNotifications = this.notificationService.unreadNotifications().filter(n => n.id !== notificationId);

   this.notificationService.unreadNotifications.set(unreadNotifications);
    
    // make a server call to notifying that the notification has been read
    // This enables the server keep track of read notification so as not to serve stale notification subsequently
    this.notificationService.notificationIsRead(notificationId, this.currentUser!.id).subscribe({

     

      complete:() =>  this.getTopicAndDuration(metadata, topic, duration,subjectName,category)
    })

   
   }
   })


    }

    }

    // gets the assessment topic and its duration
    private getTopicAndDuration(testId:number, topic:string, duration:number, subjectName:string, category:string){
    
      // try fetching from the in-app cache 
      if(this.assessmentService.getTopicAndDuration.length){

        this.topicAndDurationSub$ = this.assessmentService.getSelectedTopicAndDuration(testId).subscribe({
   
          next:(result) =>{
  
            
            topic = result.topic;
            duration = result.duration;
           
           
          },
  
          // routes to assessment commencement page
          complete:() => this.router.navigate(['/start', topic, duration, subjectName, category])
        
        })
      }else{

         // Make a a get request to the server to retrieve both the 'topic' and 'duration' for the assessment referenced by the given 'testId'
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

    goBack() {
      
      window.history.back()
      }
}
