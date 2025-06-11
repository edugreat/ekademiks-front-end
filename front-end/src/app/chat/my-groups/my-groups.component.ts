import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService, GroupChatInfo } from '../chat.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';
import { MatInput } from '@angular/material/input';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { setsEqual } from 'chart.js/dist/helpers/helpers.core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf, KeyValuePipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatBadge } from '@angular/material/badge';
import { MatTooltip } from '@angular/material/tooltip';
import { RightClickDirective } from '../../shared/right-click.directive';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatList, MatListItem } from '@angular/material/list';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-my-groups',
    templateUrl: './my-groups.component.html',
    styleUrl: './my-groups.component.css',
    standalone: true,
    imports: [MatToolbar, MatFormField, MatLabel, MatSelect, NgFor, MatOption, MatBadge, MatTooltip, RightClickDirective, NgIf, MatInput, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, MatSidenavContainer, MatSidenav, MatList, MatListItem, MatSidenavContent, RouterOutlet, KeyValuePipe]
})
// components that displays all the group chats the student belongs to
export class MyGroupsComponent implements OnInit, OnDestroy{




  // an object representing the user's group chat. The key is the group the user belong to and the value is the previous chats
  groupChatInfo?:Map<number, GroupChatInfo>;

  editableChat:any;

  groupChatInfoSub?:Subscription;

  private sub?:Subscription;

  @ViewChild(MatMenuTrigger) menuTrigger!:MatMenuTrigger;


  @ViewChild(MatInput) inputField!:MatInput;

  // controls the visibility of matMenu trigger
  hideMenuTrigger = true;
  editingMode = false;

  private chatService = inject(ChatService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationDialogService);
  private authService = inject(AuthService);

  private currentUser = toSignal(this.authService.loggedInUserObs$);

  
  constructor(){}
  
  
  ngOnInit(): void {
    

    const studentId = this.activatedRoute.snapshot.paramMap.get('studentId');

    if(studentId) {

    
      this.getGroupInfo(Number(studentId));

    }

  }


  ngOnDestroy(): void {
    
    this.sub?.unsubscribe();
   
  }



  private getGroupInfo(studentId:number){

   this.chatService.groupInfo(studentId).pipe(take(1)).subscribe({
      next:(info:Map<number, GroupChatInfo>) => {

      
        this.groupChatInfo = info;


      },

      error:(err) => console.log(err)
    });

  }

  connectToChat(groupId:number, groupDescription:string, groupAdminId:string){


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

          const _studentId = `${this.currentUser()?.id}`;
          if(confirm && _studentId){

            this.chatService.deleteGroupChat(_studentId, this.editableChat.key).pipe(take(1)).subscribe({

              next:(val:HttpResponse<number>) => {

                const _studentId = this.currentUser()?.id;
                // reload the group chats
               if(_studentId ){
                this.getGroupInfo(Number(_studentId));
               }
               
              },
              error:(err) => console.log(err)

             
            })
          }
        })

      
        }
      }

     
      // determines if the current user the group admin
      isGroupAdmin():boolean{

        return this.currentUser() ? this.currentUser()?.id === this.editableChat.value.groupAdminId : false;
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
            const _studentId = `${this.currentUser()?.id}`;

            if(_studentId){

             
              this.chatService.editGroupName(_studentId, this.editableChat.key, currentGroupName).pipe(take(1)).subscribe({

                next:(val:HttpResponse<number>) => {

                  if(this.groupChatInfo!.hasOwnProperty(this.editableChat.key)){

                    // rename the group chat name at the client side without needing to do page refresh
                    
                    this.groupChatInfo!.get(this.editableChat.key)!.groupName = currentGroupName;

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

          return this.currentUser() ? this.currentUser()!.roles.includes('Student'): false;
        }

        leaveGroup() {
          
          // confirm they really want to leave group chat
          this.confirmationService.confirmAction(`Leave ${this.editableChat.value.groupName} group ?`);

          this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(response => {

            if(response && this.isLoggedInStudent()){

              this.chatService.leaveGroup(this.editableChat.key, this.currentUser()!.id).pipe(take(1)).subscribe({
                // refetch the group info after status code is 200
                
                next:(response:HttpResponse<number>) => {

                  // checks if the student still belongs to some other groups after exiting the current group chat
                  if(response.status === HttpStatusCode.Ok){

                    // set a flag that forbids them from sending messages to the group immediately they leave the group chat. 
                    // This flag would not be needed if the page were refreshed as the system will update user legibility to post.
                    sessionStorage.setItem('forbidden', (this.editableChat.key as string));

                    const cachingKey = sessionStorage.getItem('cachingKey');
                     if(cachingKey){

                      this.authService.cachedUser(cachingKey).subscribe(_=>{


                          // does not belong to any group chat
                      if(!(this.currentUser() && this.currentUser()?.isGroupMember)){

                       
                        // route them to the home page
                        this.router.navigate(['/home']);
                      }else{

                        // update the group chat info
                        this.getGroupInfo(this.currentUser()!.id);
                      }

                      })
                    
                     }
                    
                    
                  }

                }
              })
            }
          })
          }
}


