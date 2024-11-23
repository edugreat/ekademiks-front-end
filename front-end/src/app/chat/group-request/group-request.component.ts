import { Component, OnDestroy, OnInit } from '@angular/core';
import { GroupChatInfo, ChatService, GroupJoinRequest } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { _Notification } from '../../admin/upload/notifications/notifications.service';

@Component({
  selector: 'app-group-request',
  templateUrl: './group-request.component.html',
  styleUrl: './group-request.component.css'
})

// component that handles user's requests to join already created group chats.
export class GroupRequestComponent implements OnInit, OnDestroy {


  
  groupChats?:GroupChatInfo;

  groupJoinRequestSub?:Subscription;

  myGroupsSub?:Subscription;

  // stores all the group ids the current user belongs to
  _myGroupIds?:number[];

  // store IDs of all the groups the user has pending request approval
  // this is to ensure the user does not send multiple join request
  pendingGroupChatRequests?:number[];

  pendingRequestSub?:Subscription;

  
  
  constructor(private chatService:ChatService, private activatedRoute:ActivatedRoute){}
  
  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe({
      next:() => {

        this.fetchChatGroups()
      },

     
    })
    

  }

     

ngOnDestroy(): void {

  this.groupJoinRequestSub?.unsubscribe();
  this.pendingRequestSub?.unsubscribe()
 
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


    // retrieves true is the current user is already a member of the group chat
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

        this.myGroupsSub = this.chatService.myGroupIds(studentId).subscribe({

          next:(ids:number[]) => {

            this._myGroupIds = ids;
          },

          // get the IDs of the group chat the user has already sent join requests awaiting response
          complete:() => {

            this.pendingRequestSub = this.chatService.getPendingGroupChatRequestsFor(Number(this.studentId())).subscribe({
              next:(pendingRequests:number[]) => {
            
              
                this.pendingGroupChatRequests = pendingRequests
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

          this.groupJoinRequestSub = this.chatService.sendJoinRequest(joinRequest).subscribe({

            error: (error) => console.log(error)
          })
        }

        }

        
        goBack() {
        
          window.history.back();
        }

        // checks if the current user has sent a join request for this group chat(referenced by groupId) which has yet to be approved
        hasPendingRequest(groupId:string):boolean{

          if(this.pendingGroupChatRequests && this.pendingGroupChatRequests.length > 0){

            const exists = this.pendingGroupChatRequests.findIndex(x => x === Number(groupId));

            if(exists >= 0) return true;


          }


          return false
        }
}


