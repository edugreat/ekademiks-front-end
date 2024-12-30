import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ChatService } from '../chat.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-new-group-chat',
  templateUrl: './new-group-chat.component.html',
  styleUrl: './new-group-chat.component.css'
})
export class NewGroupChatComponent implements OnInit {

  // icons to display on the view page so the group admin can select group icon
  icons : {value:string, viewValue:string}[] = [];

  // flag used to display the progress-spinner once the chat group form is being submitted
  submittingGroupChatForm = false;

  constructor(private fb:FormBuilder, private confirmationService:ConfirmationDialogService,
    private router:Router, private chatService:ChatService, private authService:AuthService
  ){}
  

  groupChatForm:FormGroup = this.fb.group({

    id:new FormControl<number>(0),
    groupName: new FormControl<string>('',{
      validators:[Validators.required]
    }),

    createdAt:new FormControl<Date | undefined>(new Date()),
    description: new FormControl<string>('',{
      validators:[Validators.required]
    }),

    groupIconUrl: new FormControl<string>('',{
      validators: [Validators.required]
    }),

    groupAdminId: new FormControl<number>(0),

    isGroupLocked: new FormControl<boolean>(false),


  });



  ngOnInit(): void {
    
    this.loadIcons();
  }
// loads icons from the assets folder in the classpath
  private loadIcons() :void{

    const iconFileNames = ['apple','moon','navigate','prism','planet','power','pin',
      'radio','repeat','ribbon','rocket','rose','school','server','shirt','ticket','trend','wine'];
       
      this.icons = iconFileNames.map(iconName => {

        return {
          value: `assets/icons/${iconName}.png`,
          viewValue: iconName
        };
      });

  }

  private groupName() : FormControl{

    return this.groupChatForm.get('groupName') as FormControl;
  }

  private description():FormControl{

    return this.groupChatForm.get('description') as FormControl;
  }

  private groupIcon():FormControl{

    return this.groupChatForm.get('groupIconUrl') as FormControl;
  }

  private groupAdminId():FormControl{

    return this.groupChatForm.get('groupAdminId') as FormControl;
  }


  // validates the form before allowing for submission to the server
  canCreateGroup():boolean{

    return (this.groupName().value as string).trim().length > 0 && (this.description().value as string).trim().length > 0 && (this.groupIcon().value as string).length > 0; 
  }

  private getGroupAdminId():number | undefined{

    if(sessionStorage.getItem('studentId'))
      return Number(sessionStorage.getItem('studentId'));

    return undefined;

  }

  createroup() {
   
  //  ensures the group admin's id is available
  const id = this.getGroupAdminId();
    if(id){

      this.submittingGroupChatForm = true;

     

      // updates the group admin's id form control value to the value of group admin's id
      this.groupAdminId().setValue(id);

       // disable the form group chat form
       this.groupChatForm.disable();

      

     this.chatService.createGroupChat(this.groupChatForm.value).subscribe({

      next:(response:HttpResponse<number>) => {

        if(response.status === HttpStatusCode.Ok){

         this.authService.updateGroupJoinedDates(this.studentId)

         this.router.navigate(['/my-groups', Number(sessionStorage.getItem('studentId'))]);

        //  the user is now a group member
         sessionStorage.setItem('groupMember', 'true');
        }

      }
     })
    
    }
   
    }

    private get studentId():number{

      return Number(sessionStorage.getItem('studentId'));
    }

onCancel() {
  
  this.confirmationService.confirmAction("Cancel group creation?");

  this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(response => {

    if(response) window.history.back();
  })
  }
  
}
