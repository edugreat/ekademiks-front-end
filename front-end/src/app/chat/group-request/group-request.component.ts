import { Component, OnInit } from '@angular/core';
import { GroupChatInfo, ChatService, GroupJoinRequest } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { _Notification } from '../../admin/upload/notifications/notifications.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService, User } from '../../auth/auth.service';
import { MatButton } from '@angular/material/button';
import { NgFor, NgIf, KeyValuePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardActions } from '@angular/material/card';

@Component({
    selector: 'app-group-request',
    templateUrl: './group-request.component.html',
    styleUrl: './group-request.component.css',
    standalone: true,
    imports: [MatButton, NgFor, MatCard, MatCardHeader, MatCardTitle, MatCardActions, NgIf, KeyValuePipe]
})

// component that handles user's requests to join already created group chats.
export class GroupRequestComponent implements OnInit{


  
  groupChats?:Map<number, GroupChatInfo>;


  myGroupsSub?:Subscription;

  // stores all the group ids the current user belongs to
  _myGroupIds?:number[];

  private currentUser?:User;

  private currentUserSub?:Subscription;

 

  
  
  constructor(private chatService:ChatService, private activatedRoute:ActivatedRoute, private authService:AuthService){}
  
  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe({
      next:() => {

        this.fetchChatGroups()
      },

     
    })
    

  }

 

  // fetch all the group chats so the student can send join request to any
  fetchChatGroups() {
   
    this.chatService.fetchGroupChats().subscribe({
      next:(groupChats:Map<number, GroupChatInfo>) => {

        this.groupChats = groupChats;
      },
      complete:() => this.myGroupIds()
    })
 

  }


  // private studentId():string | null{

  //   return sessionStorage.getItem('studentId');
  // }


    // retrieves true if the current user is already a member of the group chat
    isGroupMember(groupId:number): boolean {
     
     if(this._myGroupIds?.length){

     
      

      return this._myGroupIds.findIndex(id => id === groupId) >= 0;
     
    }

    return false;

      }

      // fetch id of the groups the user already belong to
      private myGroupIds(){

        
        // subscribes to get update on the current user
        this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => {

          if(user){
           
            this.currentUser = user;

            this.chatService.myGroupIds(this.currentUser.id).pipe(take(1)).subscribe({

              next:(ids:number[]) => {
    
                this._myGroupIds = ids;
              },
    
              // get the IDs of the group chat the user has already sent join requests awaiting response
              complete:() => {
    
                this.chatService.getPendingGroupChatRequestsFor(user.id).pipe(take(1)).subscribe({
                  next:(pendingRequests:number[]) => {
                   // temporarily persist the groups the user has pending pending requests for
                    sessionStorage.setItem('pending_req',JSON.stringify(pendingRequests));
                  }
                })
    
              }
              
            });

          }
        })

      



      }

      

      sendRequest(groupId: number) {
       
        if(this.groupChats!.hasOwnProperty(Number(groupId))){

          const data = this.groupChats!.get(Number(groupId));

          let joinRequest:GroupJoinRequest = {
            groupId: `${groupId}`,
            requesterId: `${this.currentUser!.id}`,
            groupAdminId: data!.groupAdminId,
            requestedAt: new Date(),
            requester:this.currentUser!.firstName
          }

         this.chatService.sendJoinRequest(joinRequest).pipe(take(1)).subscribe({

            next:(response:HttpResponse<number>) => {

              if(response.status === HttpStatusCode.Ok){

                this.myGroupIds();
              }
            },

            error: (error) => console.log(error)
          })
        }

        }

        
        goBack() {
        
          window.history.back();
        }

        // checks if the current user has sent a join request for this group chat(referenced by groupId) which has yet to be approved
        hasPendingRequest(groupId:number):boolean{

          if(sessionStorage.getItem('pending_req')){

            const pendingReqs:string[] = JSON.parse(sessionStorage.getItem('pending_req')!)
           

            // checks if the user has already sent a join request to the group referenced by the group id, and is now awaiting app
            return pendingReqs.findIndex(req => Number(req) ===groupId) !== -1;
          } else {
            
            return false
          }
       
          

         
        }
}


