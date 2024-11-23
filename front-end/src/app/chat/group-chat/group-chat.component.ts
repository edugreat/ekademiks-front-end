import { AfterViewInit, Component, Inject, inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage, ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { _Notification as _Notification } from '../../admin/upload/notifications/notifications.service';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.css'
})
export class GroupChatComponent implements OnInit, OnDestroy {


  fontSize = '10px';




  // boolean flag that shows when the notification icon has been clicked so as to view the notification detals
  _viewNotificationDetails = false;

  // an array of notifications to join the group chat
  // This notification is only visible to the group admin
  requestNotifications: _Notification[] = [];

  // notifications about new members joining the group chat
  newMemberNotifications: _Notification[] = [];
  //  shows if the snack bar is currently opened to display notifications
  private isSnackBarOPen = false;

  private chatSubscription?: Subscription;

  private joinRequestSub?: Subscription;

  newChatContent: string = '';

  // an array of both previous and current chat messages belonging to this group chat
  chatMessages: ChatMessage[] = [];


  // keeps reference to the join request notification to clear from the array of notification after the request has been approved or declined
  requestNotificationToClear?: number;


  groupId?: number; //the group ID of this group chat

  groupDescription?: string; //the group description every group must have, which idealy defines their ideology

  private _snackBar = inject(MatSnackBar);

  snackBarTimer: any;


  constructor(private chatService: ChatService, private activatedRoute: ActivatedRoute) { }



  ngOnInit(): void {


    this.activatedRoute.paramMap.subscribe(params => {

      

      const groupId = params.get('group_id');
      const groupDescription = params.get('description');
      if (groupId && groupDescription) {
        this.groupId = Number(groupId);

        this.groupDescription = groupDescription;

        this.chatService.groupChatUpdates(Number(groupId), this.loggedInStudentId());

        this.streamChats();

      }
    })

    this.joinRequestNotification();

    // removes from the request notification, the given notification ID
    if(this.requestNotificationToClear){

      this.requestNotifications.splice(this.requestNotificationToClear, 1);
    }


  }



  ngOnDestroy(): void {

    this.chatSubscription?.unsubscribe();
    this.joinRequestSub?.unsubscribe();
    clearInterval(this.snackBarTimer)
  }



  streamChats() {

    this.chatSubscription = this.chatService.chatMessages$.subscribe({
      next: (chatMessage: ChatMessage) => {


        // if we got some chats
        if (chatMessage) {

          this.addToChats(chatMessage);

        }

      },

    })


  }

  // get the number of online members from the session storage
  get onlineMembers(): number | undefined {

    const currentlyOnline = sessionStorage.getItem('online_members');



    return currentlyOnline ? Number(currentlyOnline) : undefined


  }

  // adds a chat to the array of chatMessages, if the current chat is not already in the array
  private addToChats(chat: ChatMessage) {


    const index = this.chatMessages.findIndex(c => c === chat);
    if (index < 0) {

      this.chatMessages.push(chat);

      // update online presence of members
      sessionStorage.setItem('online_members', `${chat.onlineMembers}`)
    }

  }
  loggedInStudentId(): number {

    const id = Number(sessionStorage.getItem('studentId'));

    return id;
  }

  // triggers sending new chat messages to the group
  sendChat() {


    const senderId = sessionStorage.getItem('studentId');
    if (this.groupId && senderId) {

      const newChatMessage: ChatMessage = {
        id: 0,//not actually a required field, but to prevent server reporting error 
        groupId: Number(this.groupId),
        senderId: Number(senderId),
        senderName: '',//not actually a required field, but to prevent server reporting error 
        content: this.newChatContent,
        sentAt: new Date()
      };

      this.newChatContent = '';

     
      this.chatService.sendNewChatMessage(newChatMessage).subscribe({
        next: (status: HttpResponse<number>) => {

        },

        error: (err) => console.log(err)
      })
    }

  }

  // checks if the logged in user is the group admin
  isGroupAdmin(): boolean {

    const groupAdminId = this.activatedRoute.snapshot.paramMap.get('group_admin_id');

    return groupAdminId ? Number(groupAdminId) === this.loggedInStudentId() : false;
  }

  // validates chat message to enable or disable the sent button
  validateChatContent(): boolean {

    return this.newChatContent.trim().length === 0;



  }

  private joinRequestNotification() {

    this.joinRequestSub = this.chatService.joinGroupRequest$.subscribe({
      next: (notification: _Notification) => {

        if (notification) {

          // this.requestNotifications.push(notification);

          this.addToNotifications(notification);
        }


      }
    })


  }

  // method that ensures non-duplicate notifications a re added to the notifications array
  addToNotifications(currentNotification: _Notification) {

    // check the type of notification
    switch (currentNotification.type) {
      case 'join group':

        const index: number = this.requestNotifications.findIndex(notification => notification.id === currentNotification.id);

        if (index < 0) {

          this.requestNotifications.push(currentNotification);
        }
        break;

      case 'new member':
        console.log('new member')


        const _index: number = this.newMemberNotifications.findIndex(notification => notification.id === currentNotification.id);

        if (_index < 0) {


          this.newMemberNotifications.push(currentNotification);

          if (!this.isSnackBarOPen) {
            this.showNextNotification()
          }


         
        }

    }

  }

  // returns the number of requests to join the group chat
  requestNotificationCount(): number {



    return this.requestNotifications.length > 0 ? this.requestNotifications.length : 0;
  }

  // method that gets triggered when the user has clicked the notification icon to view notification details
  viewNotificationDetails() {

    this._viewNotificationDetails = true;
  }


  // for each of the notifications received after new member joining  the group chat, display a snack bar
  private showNextNotification() {
    // Keeps records of IDs for notifications about to be shown, so they can be deleted afterwards  
    let notifiedIds: number[] = [];
    this.isSnackBarOPen = true;

    // Display the first notification immediately if available  
    if (this.newMemberNotifications.length) {
      notifiedIds.push(this.newMemberNotifications[0].id);
      this._snackBar.openFromComponent(NewMemberNotification, {
        data: this.newMemberNotifications.shift(),
        duration: 10000
      });
    }

    // Set an interval to display subsequent notifications  
    this.snackBarTimer = setInterval(() => {
      if (this.newMemberNotifications.length) {
        notifiedIds.push(this.newMemberNotifications[0].id);
        this._snackBar.openFromComponent(NewMemberNotification, {
          data: this.newMemberNotifications.shift(),
          duration: 10000
        });
      } else {
        // Clear the interval and handle cleanup  
        clearInterval(this.snackBarTimer);
        this.isSnackBarOPen = false;
        this.deleteNewMemberJoinedGroupNotification(notifiedIds);
      }
    }, 10000);
  }



  //  this method deletes all notifications(for the currently logged in student) about new members joining the group
  private deleteNewMemberJoinedGroupNotification(notificationIds: number[]) {

    this.chatService.deleteChatNotifications(this.loggedInStudentId(), notificationIds).subscribe({

      complete:() => {

        for (let index = 0; index < notificationIds.length; index++) {
         
          this.newMemberNotifications.splice(index, 1);
          
        }
      }

    })
  }
}






@Component({
  selector: 'notification-snack-bar',
  templateUrl: './notification-snack-bar.html',
  styles: `.notification {  
    display: flex;  
    flex-direction: column;  
    color: hotpink;  
    padding: 10px;  
  }  
  
  .message {  
    font-weight: bold;  
    margin-bottom: 4px; /* Space between message and date */  
  }  
  
  .date {  
    font-size: 12px; /* Smaller font size for the date */  
    color: gray; /* Optional: gray to differentiate from the message */  
  }`,
  standalone: true,
  imports: [CommonModule]
})
export class NewMemberNotification {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: _Notification) { }


}