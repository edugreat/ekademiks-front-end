import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService, GroupChatInfo } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';
import { MatInput } from '@angular/material/input';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { setsEqual } from 'chart.js/dist/helpers/helpers.core';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css'
})
// components that displays all the group chats the student belongs to
export class MyGroupsComponent implements OnInit, OnDestroy{




  // an object representing the user's group chat. The key is the group the user belong to and the value is the previous chats
  groupChatInfo?:GroupChatInfo;

  editableChat:any;

  groupChatInfoSub?:Subscription;

  private sub?:Subscription;

  @ViewChild(MatMenuTrigger) menuTrigger!:MatMenuTrigger;


  @ViewChild(MatInput) inputField!:MatInput;

  // controls the visibility of matMenu trigger
  hideMenuTrigger = true;
  editingMode = false;

  
  constructor(private chatService:ChatService, private activatedRoute:ActivatedRoute, private router:Router,
    private confirmationService:ConfirmationDialogService, private authService:AuthService
  ){}
  
  
  ngOnInit(): void {
    

    const studentId = this.activatedRoute.snapshot.paramMap.get('studentId');

    if(studentId) {

    
      this.getGroupInfo(Number(studentId));

    }

  }


  ngOnDestroy(): void {
    
    this.sub?.unsubscribe();
   
  }

 private studentId():string | undefined{

  const id = sessionStorage.getItem('studentId');

  return id ? id : undefined; 
 }

  private getGroupInfo(studentId:number){

   this.chatService.groupInfo(studentId).pipe(take(1)).subscribe({
      next:(info:GroupChatInfo) => {

      
        this.groupChatInfo = info;

      },

      error:(err) => console.log(err)
    });

  }

  connectToChat(groupId:string, groupDescription:string, groupAdminId:string){

   
   

    sessionStorage.setItem('groupId',groupId);

    this.router.navigate([groupId, groupAdminId, groupDescription],{relativeTo: this.activatedRoute})
  }

  // programmatically trigger opens the mat menu button
  triggerOpenMenu(rightCliked:boolean, chat?:any) {
    
   if(rightCliked){
     
    this.editableChat = chat;
   
    this.hideMenuTrigger = false;
    this.menuTrigger.openMenu(); 
   }


    }

    closeMenuTrigger() {
      this.hideMenuTrigger = true;
      }
   

      editGroupName() {

        this.editingMode = true

       
      
        
      
      }

      deleteGroupChat() {

        if(this.isGroupAdmin()){


        this.confirmationService.confirmAction(`${this.editableChat.value.groupName} will be deleted`);

        this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(confirm =>{

          const _studentId = this.studentId();
          if(confirm && _studentId){

            this.chatService.deleteGroupChat(_studentId, this.editableChat.key).pipe(take(1)).subscribe({

              next:(val:HttpResponse<number>) => {

                const _studentId = this.studentId();
                // reload the group chats
               if(_studentId ){
                this.getGroupInfo(Number(_studentId));
               }
               
              },
              error:(err) => console.log(err),

              complete:() => {
                
                // clears off
              sessionStorage.removeItem('inGroup');
              }
            })
          }
        })

      
        }
      }

     
      // determines if the current user the group admin
      isGroupAdmin():boolean{

        if(this.studentId()){

          return Number(this.studentId()) === this.editableChat.value.groupAdminId;
        } return false
        
      }

      // disables further processing of editing group name when the user supplies empty text
      disableSubmission():boolean {

        
        const regex2 = /^[^a-zA-Z0-9]/;
        
        
        return this.inputField ? (regex2.test(this.inputField.value) || this.inputField.value.trim().length === 0) : false;
        }

      saveChanges() {

        
        this.confirmationService.confirmAction(`rename group to ${this.inputField.value}?`);
        this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(confirm => {

          if(confirm){

            const currentGroupName = this.inputField.value;

            this.editingMode = false;

            // get the student id
            const _studentId = this.studentId();

            if(_studentId){

             
              this.chatService.editGroupName(_studentId, this.editableChat.key, currentGroupName).pipe(take(1)).subscribe({

                next:(val:HttpResponse<number>) => {

                  if(this.groupChatInfo!.hasOwnProperty(this.editableChat.key)){

                    // rename the group chat name at the client side without needing to do page refresh
                    this.groupChatInfo![this.editableChat.key].groupName = currentGroupName;

                  }
                },

                error:() => {
                  this.editingMode = false;
                },

                complete:() => {

                  this.editingMode = false;
                }
              })
            }
          }else{

            this.editingMode = false;

           
          }
        })

        
        
        }

        cancelEdit() {
          
          this.editingMode = false
        }


        isLoggedInStudent(){

          return this.authService.isLoggedInStudent;
        }

        leaveGroup() {
          
          // confirm they really want to leave group chat
          this.confirmationService.confirmAction(`Leave ${this.editableChat.value.groupName} group ?`);

          this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(response => {

            if(response && this.isLoggedInStudent()){

              this.chatService.leaveGroup(this.editableChat.key, Number(this.studentId())).pipe(take(1)).subscribe({
                // refetch the group info after status code is 200
                
                next:(response:HttpResponse<number>) => {

                  // checks if the student still belongs to some other groups after exiting the current group chat
                  if(response.status === HttpStatusCode.Ok){

                    // set a flag that forbids them from sending messages to the group immediately they leave the group chat. 
                    // This flag would not be needed if the page were refreshed as the system will update user legibility to post.
                    sessionStorage.setItem('forbidden', (this.editableChat.key as string));

                    this.authService.isGroupMember(Number(this.studentId())).pipe(take(1)).subscribe(member => {

                      // does not belong to any group chat
                      if(!member){

                        sessionStorage.removeItem('inGroup');

                        // route them to the home page
                        this.router.navigate(['/home']);
                      }else{

                        // update the group chat info
                        this.getGroupInfo(Number(this.studentId));
                      }
                    })
                  }

                },
                error:(err) => console.log(err)
              })
            }
          })
          }
}


