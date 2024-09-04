import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../admin.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
// Component used to draft notifications forwarded to the students for certain reasons (e.g assessment upload, result releases etc)

export class NotificationsComponent implements OnInit, AfterViewInit{


  // Id for the event that is being notified about.
  // The event can be assessment upload, result releases etc
  @Input()
  eventId?:number;

  // The type of notification (e.g assessment upload, result releases etc)
  @Input()
  typeOfTask?:string;

  // Object representing new notification we intend to forward to the server alerting student of important information
  newNotification:NotificationDTO | undefined;

  notificationForm?:FormGroup;

  // If the audience checkbox was checked
  private isChecked = false;

  @ViewChild('audienceCheck') audienceCheck?:MatCheckbox;

// Used to disable the input fields during form submission to avoid re-submission 
  disableFields = false;

 

  public constructor(private adminService:AdminService, private fb:FormBuilder){}

  ngOnInit(): void {
   
   this.getDetailsAboutNotification();


  }

ngAfterViewInit(): void {
  
  this.audienceCheck?.change.subscribe(() =>{

    this.isChecked = !this.isChecked;
  });
this.audienceInputChange();
 
}
  // Method that processes the activated route to get information that would help draft the notification
  private getDetailsAboutNotification(){

    
// If these variables are availabele, then initiliaze new notification
      if(this.eventId && this.typeOfTask){

       
        this.newNotification = {

          metadata:this.eventId,
          type:this.typeOfTask,
          audience:[]
        }

        // Initialize the notification form group
        this.notificationForm = this.fb.group({
          message: new FormControl<string>('', Validators.required),
          audience: new FormControl<string|undefined>('')
        })
       
      }
  
  }
// Immediately send notification
  notify() {
    
      this.processInput();

      this.adminService.sendNotifications(this.newNotification!).subscribe({

        // Set milestone to 3 once we are sure notification was sent successfully
        next:(response:HttpResponse<void>) => {
       
          if(response.status  === HttpStatusCode.Ok) {
           
            this.adminService.setTaskMilestone(3)

          }
          
          },

        // incase of erro, log it for the time being
        error:(err) => console.log(err)
      })
    


    }

    // Processes the notification form and determines if the inputs align with the requirements
     canSubmit():boolean{

      const anyMessage = this.notificationForm?.get('message')?.value;
      
      if(!anyMessage) return false;
      
      if(anyMessage &&  this.isChecked) return true;

      const audienceInput = this.notificationForm?.get('audience')?.value;
      
      if(!audienceInput) return false;
      

        return true;
    }

    // Process the audience input as the user types, just to ensure non-zero leading input
    private audienceInputChange(){

      
      let arr:string[];
      this.notificationForm?.get('audience')?.valueChanges.subscribe(() =>{

        // it temporarily stores the user input after leading zeros are removed if any
        arr = [];
        
        const input:string = this.notificationForm?.get('audience')?.value;
        // calls split method on the input string returning all values delimited by one or more white spaces
        input.split(/\s+/).forEach(x =>{

          // checks if the input is zero-leading, the it removes the zero prefix
          if(x.charAt(0) === '0'){
           arr.push(x.substring(1));
          }
          else{
            arr.push(x);
          }
        })

        // if there is anything in the array, reset the value of the form control with each of the array elements, separating them by white
        // spaces, then stopping further event emission to avoid call stack issue.
      if(arr.length){
        
        this.notificationForm?.get('audience')?.setValue(arr.join(' '),{emitEvent:false});
      }
      })
    }
    // processess the inputs received
    private processInput(){

      // sets disableFields to true just to disable the input fields to avoid form re-submission
      this.disableFields = true;

      // get the value for audience
      this.newNotification!.message = this.notificationForm?.get('message')!.value;
      
      // If audience was provided
      if(this.notificationForm?.get('audience')?.value){

        // Non zero leading numerical values regex
      const regexp = /([1-9]\d*)/g;

      // return an array containing just the numerical value without the white spaces
      const audience:string[] | null = (this.notificationForm!.get('audience')!.value as string).match(regexp);

      // if audience was actually provided, fill the 'newNotification' audience property with it.
      if(audience){
       
        this.newNotification?.audience?.push(...audience);
      }
      

      }

     


    }

    
}

// DTO of notification forwarded to the server for data persistence of the just created notification
export type NotificationDTO = {
metadata:number, // describes id of what we are notifying about
type:string, // describes type of notification(e.g assessment upload etc)
message?:string, // overview description about the notification
audience:string[]  // who the notification is target to
}