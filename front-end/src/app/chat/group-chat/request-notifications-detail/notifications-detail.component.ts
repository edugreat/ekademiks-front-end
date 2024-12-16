import { Component, EventEmitter, Input, input, OnDestroy, Output } from '@angular/core';
import { _Notification } from '../../../admin/upload/notifications/notifications.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { ChatService } from '../../chat.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-request-notifications-detail',
  templateUrl: './notifications-detail.component.html',
  styleUrl: './notifications-detail.component.css'
})

// component that displays all the notifications a user has got
export class NotificationsDetailComponent implements OnDestroy {

  constructor(private confirmationService:ConfirmationDialogService, private chatService:ChatService){}
  



  @Input()
  notifications?:_Notification[];

  @Input()
  groupId?:number; // the group ID of the group chat the notification is meant for

  // emits false when the goBack() is clicked just to allow the parent component to display
  @Output()
  notificationDetails = new EventEmitter<boolean>();

  // emits notification ID so the parent notifications array can remove it after request has been approved or declined
  @Output()
  clearParentJoinRequestNotification = new EventEmitter<number|undefined>


  approveSub?:Subscription;

  declineSub?:Subscription;

  ngOnDestroy(): void {
    
    this.approveSub?.unsubscribe();
    this.declineSub?.unsubscribe();
  }

  goBack(joinRequestNotificationId?:number) {
    
    this.approveSub?.unsubscribe();
    this.declineSub?.unsubscribe();
    
    this.notificationDetails.emit(false);

    this.clearParentJoinRequestNotification.next(joinRequestNotificationId)

   
    }


    // calls the service method to approve the user's request to join the group chat whose ID referenced by groupId
    approveRequest(joinRequest: _Notification) {

      this.confirmationService.confirmAction('Approve this request?');

      this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(approve => {

       
        if(approve && this.groupId){
        
          this.approveSub = this.chatService.approveJoinRequest(this.groupId, joinRequest.metadata, joinRequest.id).subscribe({

            complete:() => {

             this.updateUserPendingRequests(joinRequest);
              this.goBack(joinRequest.id)
            
            }
          
          })

        }
      })
    

    }

    declineRequest(joinRequest: _Notification) {

      this.declineSub = this.chatService.declineJoinRequest(this.groupId!, joinRequest.metadata, joinRequest.id).subscribe({

        complete:() => {

            // removes the request from the list of requests the user is awaiting response from the admin
            this.updateUserPendingRequests(joinRequest);
          this.goBack(joinRequest.id)
        
        }
      });
    
    }

// handles updating of user's pending join requests 
  private updateUserPendingRequests(joinRequest: _Notification) {
    if (sessionStorage.getItem('join_req')) {

      let pendingReqsIDS: string[] = JSON.parse(sessionStorage.getItem('join_req')!);

      pendingReqsIDS.splice(pendingReqsIDS.findIndex(req => Number(req) === joinRequest.id), 1);

      // if there are no more pending request for the user, then remove the item from the session storage
      if (!pendingReqsIDS.length) {
        sessionStorage.removeItem('pending_req');
      } else {

        sessionStorage.setItem('pending_req', JSON.stringify(pendingReqsIDS));
      }


    }
  }
}
