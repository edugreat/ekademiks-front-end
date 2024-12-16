import { Component, OnInit } from '@angular/core';
import { GroupChatInfo, ChatService, GroupJoinRequest } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { _Notification } from '../../admin/upload/notifications/notifications.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-group-request',
  templateUrl: './group-request.component.html',
  styleUrl: './group-request.component.css'
})

// component that handles user's requests to join already created group chats.
export class GroupRequestComponent implements OnInit{


  
  groupChats?:GroupChatInfo;


  myGroupsSub?:Subscription;

  // stores all the group ids the current user belongs to
  _myGroupIds?:number[];

 

  
  
  constructor(private chatService:ChatService, private activatedRoute:ActivatedRoute){}
  
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
      next:(groupChats:GroupChatInfo) => {

        this.groupChats = groupChats;
      },
      complete:() => this.myGroupIds()
    })
 

  }


  private studentId():string | null{

    return sessionStorage.getItem('studentId');
  }


    // retrieves true if the current user is already a member of the group chat
    isGroupMember(groupId:string): boolean {
     
     if(this._myGroupIds?.length){

     
      const _id = Number(groupId);

      return this._myGroupIds.findIndex(id => id === _id) >= 0;
     
    }

    return false;

      }

      // fetch id of the groups the user already belong to
      private myGroupIds(){

        const studentId = Number(sessionStorage.getItem('studentId'));
       if(studentId){

        this.chatService.myGroupIds(studentId).pipe(take(1)).subscribe({

          next:(ids:number[]) => {

            this._myGroupIds = ids;
          },

          // get the IDs of the group chat the user has already sent join requests awaiting response
          complete:() => {

            this.chatService.getPendingGroupChatRequestsFor(Number(this.studentId())).pipe(take(1)).subscribe({
              next:(pendingRequests:number[]) => {
               // temporarily persist the groups the user has pending pending requests for
                sessionStorage.setItem('pending_req',JSON.stringify(pendingRequests));
              }
            })

          }
          
        });
       }



      }

      private username():string{
      
        const _username = sessionStorage.getItem('username');

        return _username !== null ? _username: '';
      }

      sendRequest(groupId: string) {
       
        if(this.groupChats!.hasOwnProperty(Number(groupId))){

          const data = this.groupChats![Number(groupId)];

          let joinRequest:GroupJoinRequest = {
            groupId: groupId,
            requesterId: this.studentId(),
            groupAdminId: data.groupAdminId,
            requestedAt: new Date(),
            requester:this.username()
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
        hasPendingRequest(groupId:string):boolean{

          if(sessionStorage.getItem('pending_req')){

            const pendingReqs:string[] = JSON.parse(sessionStorage.getItem('pending_req')!)
           

            // checks if the user has already sent a join request to the group referenced by the group id, and is now awaiting app
            return pendingReqs.findIndex(req => Number(req) === Number(groupId)) !== -1;
          } else {
            
            return false
          }
       
          

         
        }
}


