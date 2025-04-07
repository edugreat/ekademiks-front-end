import { Component, ElementRef, Inject, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatMessage, ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { _Notification as _Notification } from '../../admin/upload/notifications/notifications.service';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgIf, NgFor, NgStyle, DatePipe } from '@angular/common';
import { ChatCacheService } from '../chat-cache.service';
import { AuthService, User } from '../../auth/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { NotificationsDetailComponent } from './request-notifications-detail/notifications-detail.component';

@Component({
    selector: 'app-group-chat',
    templateUrl: './group-chat.component.html',
    styleUrl: './group-chat.component.css',
    standalone: true,
    imports: [NgIf, MatProgressSpinner, MatAnchor, MatTooltip, MatIcon, MatBadge, NgFor, MatIconButton, MatMenuTrigger, NgStyle, MatMenu, MatMenuItem, MatFormField, MatLabel, MatSuffix, MatInput, CdkTextareaAutosize, FormsModule, NotificationsDetailComponent, DatePipe]
})
export class GroupChatComponent implements OnInit, OnDestroy {



  // Arbitrary content for deleted chats
  private DELETEDCHATCONTENT = '$2a$10$IFch8ji5EgMhuOQdBjdIE.tzyvQbtCEdHSsujbSUALasTHPA87GwO';



  fontSize = '10px';

  currentlyClickedChat?: ChatMessage;

  // holds reference to the list of elements in the #chatMessageRef
  @ViewChildren('chatMessageRef') chatMessageRefs!: QueryList<ElementRef>;

  @ViewChild('textAreaDiv') textAreaDiv!: ElementRef<HTMLDivElement>;

  @ViewChild('textarea') textArea!: ElementRef<HTMLTextAreaElement>

  // indicates if chat message is being edited or not
  editingChat = false;

  // indicates if a chat is being replied to
  _replyToChat = false;

  // indicates chat content currently copied to the clipboard
  copiedText = '';

  // boolean flag that shows when the notification icon has been clicked so as to view the notification detals
  _viewNotificationDetails = false;

  // an array of notifications to join the group chat
  // This notification is only visible to the group admin
  requestNotifications: _Notification[] = [];

  // notifications about new members joining the group chat
  newMemberNotifications: _Notification[] = [];
  //  shows if the snack bar is currently opened to display notifications
  private isSnackBarOPen = false;

  private chatMessageSub?: Subscription;


  private joinRequestSub?: Subscription;

  chatNotificationSub?: Subscription;

  newChatContent: string = '';

  groupAdminId?: number;

   //loggedInStudentId:number|undefined = 0;

   currentUser?:User;

 

  // an array of both previous and current chat messages belonging to this group chat
  chatMessages: ChatMessage[] = [];


  tilde:string ='~'


  groupId?: number; //the group ID of this group chat

  groupDescription?: string; //the group description every group must have, which idealy defines their ideology

  private _snackBar = inject(MatSnackBar);

  snackBarTimer: any;

  // Date representing instance a user joins a group chat
  groupJoinDate?:Date;

  groupJoinDateSub?:Subscription;


  @ViewChild('chatContainer') chatContainer!: ElementRef;

  currentUserSub?: Subscription;
  




  constructor(private chatService: ChatService, private activatedRoute: ActivatedRoute, 
    private chatCachedService:ChatCacheService, private authService:AuthService) { }



  ngOnInit(): void {


    this.activatedRoute.paramMap.subscribe(params => {

   
      const _groupId = params.get('group_id');
      const groupDescription = params.get('description');

      const _grpAdminId = params.get('group_admin_id');

      

    //  get the object of the current user
    this._currentUser();


      if (_groupId && groupDescription && _grpAdminId) {

        this.subscribeToJoinedDate(_groupId);

       

        // unsubscribe from the receiving background message for the this group, then subscribe to receiving background message for the previous group
      this.chatMessageSub?.unsubscribe();

      // emits negative ID value to subscribers to unsubscribes from receiving backgound update for the group chat
      this.chatService.backgroundChatUpdate.next(-1 * Number(_groupId))

      if(this.groupId){

        // emits group ID to subscribers to subscribe to receiving background messages
        this.chatService.backgroundChatUpdate.next(this.groupId)
      }


        this.groupId = Number(_groupId);

        this.groupDescription = groupDescription;
        this.groupAdminId = Number(_grpAdminId);


        // load chats for the given group
       this.loadChats(_groupId);

        // checks if the user had recent messages
        this.hadRecentPosts();





      }
    })





  }

  // subscribes to service method to get date the user joined the group chat
  private subscribeToJoinedDate(groupId:string){
    

    setTimeout(() => {
      
    
       // forces the service to emit the date the user joined this group chat
     this.getJoinedDate(groupId);
        // subscribes to receive the date the user joined the group chat
        this.groupJoinDateSub = this.authService.groupJoinDateOb$.subscribe(date => this.groupJoinDate = date);

    }, 2000);

  }

  getJoinedDate(_groupId: string) {
    
   this.authService.getJoinDates(Number(_groupId));
  }
  async loadChats(_groupId: string) {
   
    // try loading cached chats first

    this.chatMessages = await this.chatCachedService.getCachedChat(_groupId);

    // if messages where received and user is logged in(cachingKey stored in the session storage helps to verify a user was logged in)
    if(this.chatMessages.length === 0 && this.currentUser){

      this.chatService.connectToChatMessages(Number(_groupId),this.currentUser!.id);

     
    }

    this.streamChats();

    this.streamChatNotifications(_groupId);

    
  }


  


  ngOnDestroy(): void {


    this.joinRequestSub?.unsubscribe();
    clearInterval(this.snackBarTimer);

    this.chatNotificationSub?.unsubscribe();

    this.currentUserSub?.unsubscribe();

    this.groupJoinDateSub?.unsubscribe();

    // disconnect from the receiving chat messages
    //this.chatService.disconnectFromSSE();


  }


  streamChatNotifications(groupId:string) {
    
    this.chatNotificationSub = this.chatService.streamChatNotificationsFor(Number(groupId)).subscribe({
      next: (data:_Notification | undefined) => {

        if(data){

          this.addToNotifications(data);
        }


      }
    })
  }

  get isLoggedIn(){

    return sessionStorage.getItem('logged') !== null;
  }

 private _currentUser(){

  this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => {
    this.currentUser = user;

   
  
  });

  }

  

  private streamChats() {



    this.chatMessageSub = this.chatService.streamChatMessagesFor(this.groupId!).subscribe({

      next: (data: ChatMessage | undefined) => {

        if (data) {

          this.addToChats(data);
        }
      },

      error: (err) => console.warn(`error streaming chat: ${err}`)
    });






  }



  // shows when the mouse right button is clicked
  showChatMenu(chat: ChatMessage) {

    this.currentlyClickedChat = chat;

  }


  async copyToClipboard(chatMessage: string | undefined): Promise<void> {


    if (chatMessage) {


      try {

        await navigator.clipboard.writeText(chatMessage);

        this.copiedText = chatMessage;



        setTimeout(() => {

          this.copiedText = '';

          this.currentlyClickedChat = undefined;

        }, 5000);



      } catch (error: unknown) {

        if (error instanceof Error) {

          console.log(`could not copy to clipboard due to ${error}`)

        } else {

          console.log(`Unknown error while copying to clipboard`)

        }
      }

    }
  }

  private scrollToTextArea() {

    const element = this.textAreaDiv.nativeElement;

    element.scrollIntoView({
      block: 'end', behavior: 'smooth'
    });

    if (this.textArea) {

      this.textArea.nativeElement.focus({ preventScroll: true })
    }

    element.classList.add('animated-border');

    setTimeout(() => {

      element.classList.remove('animated-border');

    }, 10000);


  }

  editChat() {

    if (this.currentlyClickedChat) {



      this.editingChat = true;

      this.newChatContent = this.currentlyClickedChat.content;
      this.scrollToTextArea();



    }


  }

  // replies to a chat
  replyToChat() {

    //confirm a chat is being replied to
    if (this.currentlyClickedChat) {

      this._replyToChat = true;

      this.newChatContent = `Your reply...`;
      this.scrollToTextArea();

    }


  }


  deleteChat() {

    // only the chat author or the group admin is permitted to delete the chat
    if (this.currentlyClickedChat?.senderId === this.currentUser?.id || this.isGroupAdmin()) {

      this.chatService.deleteChatMessage({ [this.currentlyClickedChat!.groupId]: this.currentlyClickedChat!.id! }, this.currentUser!.id)
        .pipe(take(1)).subscribe({

          next: (response: HttpResponse<number>) => {

            if (response.status === HttpStatusCode.Ok) {

              // remove the chat from the array of chats
              const index = this.chatMessages.findIndex(msg => msg.id === this.currentlyClickedChat?.id);

              if (index >= 0) {

                const deleteChats = this.chatMessages.splice(index, 1);



                if (deleteChats.length) {


                  // get all the chats that have replied to deleted chat and set who deleted it
                  const repliers = this.getRepliers(this.currentlyClickedChat!.id!);

                  // update the underlying message with user's that deleted the chat
                  for (let index = 0; index < repliers.length; index++) {

                    let replier = repliers[index];

                    // update the deleteBy property
                    replier.deleterId = this.currentUser?.id;

                    // set deleter's name
                    (replier.deleter === this.currentUser?.firstName) ? this.currentUser?.firstName : undefined;


                    // replace the old chat with the updated chat
                    this.chatMessages.splice(this.chatMessages.findIndex(c => c.id === replier.id), 1, replier);

                  }


                }

                this.chatService.cachedMessage(this.groupId!, this.chatMessages); // update session storage
              }
            }
          }
        })


    }


  }

  

  // get the IDs of chat that replied to a given chat
  private getRepliers(id: number): ChatMessage[] {

    return this.chatMessages.filter(msg => msg.repliedTo === id);
  }

  // checks if the logged in was the sender of the chat message
  isAuthor(): boolean {

    if (this.currentlyClickedChat) {

      return this.currentUser?.id === this.currentlyClickedChat.senderId;
    }

    return false;


  }


  // get the number of online members from the session storage
  get onlineMembers(): number | undefined {

    const currentlyOnline = sessionStorage.getItem(`online_members_${this.groupId}`);



    return currentlyOnline ? Number(currentlyOnline) : undefined


  }

  // adds a chat to the array of chatMessages, if the current chat is not already in the array
  private addToChats(currentMessage: ChatMessage) {

    switch (currentMessage.content) {
      case this.DELETEDCHATCONTENT:

        // remove from the chat messages this deleted chat
        this.chatMessages.splice(this.chatMessages.findIndex(c => c.id === currentMessage.id), 1);

        // get all the replies to the deleted message
        let repliers = this.getRepliers(currentMessage.id!)

        if (repliers.length) {
          for (let index = 0; index < repliers.length; index++) {

            let replier = repliers[index];
            replier.deleterId = currentMessage.deleterId;
            replier.deleter = currentMessage.deleter;

            this.chatMessages.splice(this.chatMessages.findIndex(c => c.id === replier.id), 1, replier)

          }

        }


        break;

      default:

        // check for case of chat editing
        const index = this.chatMessages.findIndex(c => c.id === currentMessage.id);

        if (index >= 0 && currentMessage.content !== this.chatMessages[index].content) {

          // edit the chat content
          this.chatMessages[index].content = currentMessage.content;
          this.chatMessages[index].isEditedChat = true;
        } else if (index < 0) {

          // this is the case of a new message
          const index = this.chatMessages.findIndex(c => c.id === currentMessage.id);
          index ? this.chatMessages.push(currentMessage) : '';


          // scrolls down to give visibility to the new chat
          // scrolls to the bottom
          setTimeout(() => {
            this.scrollToBottom()
          }, 0);
        }


    }


    // update session storage
    this.chatService.cachedMessage(this.groupId!, this.chatMessages);

    // update number of online users for the group chat
    sessionStorage.setItem(`online_members_${this.groupId}`, `${currentMessage.onlineMembers}`);

  }


  // Automatically scrolls to the bottom (allowing views) when previous chats keep populated and when new chat arrives
  private scrollToBottom() {

    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (error) {
      console.log(`could not scroll: ${error}`)
    }

  }

  // finds out if the user has received chats since they had joined the group chat.
  //This is used to control the display of spinner while waiting for the retrieval of previous chats
  private hadRecentPosts() {

   

    if (this.currentUser?.id && this.groupId) {

      this.chatService.hadPreviousPosts(this.currentUser.id, this.groupId).pipe(take(1)).subscribe({
        next: (result) => {
          if (result) {
            sessionStorage.setItem('recentPosts', 'true');
          }
        }
      })

    }

  }

 

  recentPosts(): boolean {

    return (sessionStorage.getItem('recentPosts') ? true : false)
  }


  // triggers sending new chat messages to the group
  sendChat() {


   
    if (this.groupId && this.currentUser?.id && this.newChatContent.trim().length) {



      // handle differently for the case of chat editing
      if (this.currentlyClickedChat && this.editingChat) {

        // get the chat message being edited
        let editableChat = this.chatMessages.find(chat => chat.id === this.currentlyClickedChat!.id);
        if (editableChat) {

          //    // update the content of the chat
          const updatedChat: ChatMessage = {
            id: editableChat.id,
            groupId: editableChat.groupId,
            senderId: editableChat.senderId,
            content: this.newChatContent,
            isEditedChat:true,
            sentAt: editableChat.sentAt

          }

          this.chatService.updateChat(updatedChat).pipe(take(1)).subscribe({
            next: (response: HttpResponse<number>) => {

              if (response.status === HttpStatusCode.Ok) {


                // replace existing chat with the edited chat
                editableChat!.content = this.newChatContent;
                editableChat!.isEditedChat =true;

                this.newChatContent = '';

              }


            },
            error: (err) => {
             

              editableChat = undefined;
              this.newChatContent = '';

            },

            complete: () => {
              this.editingChat = false;

              editableChat = undefined;

              this.newChatContent = '';
            }
          })

          return;
        }

        // handle differently if this is a reply chat
      } else if (this.currentlyClickedChat && this._replyToChat) {

        const newChatMessage: ChatMessage = {
          id: 0,//not actually a required field, but to prevent server reporting error 
          groupId: Number(this.groupId),
          senderId: Number(this.currentUser.id),
          senderName: '',//not actually a required field, but to prevent server reporting error 
          content: this.newChatContent,
          isEditedChat: false,
          repliedTo: this.currentlyClickedChat.id,
          repliedToChat: this.currentlyClickedChat.content,
          sentAt: new Date()
        };

        this.newChatContent = '';

        this._replyToChat = false;

        this.chatService.sendNewChatMessage(newChatMessage).pipe(take(1)).subscribe({
          next: () => {

          },

          error: (err) => console.log(err)
        })

        return;

      }

      // handle differently for fresh chat message
      else {

        

        const newChatMessage: ChatMessage = {
          id: 0,//not actually a required field, but to prevent server reporting error 
          groupId: Number(this.groupId),
          senderId: Number(this.currentUser.id),
          senderName: '',//not actually a required field, but to prevent server reporting error 
          content: this.newChatContent,
          isEditedChat:false,
          sentAt: new Date()
        };

        this.newChatContent = '';


        this.chatService.sendNewChatMessage(newChatMessage).subscribe({
          next: (response: HttpResponse<number>) => {
            if (response.status === HttpStatusCode.Ok) {

             // this.chatMessages.push(newChatMessage)

              console.log('success');
            }


          },

          error: (err) => console.log(err),

        })


      }


    }

  }

  // returns boolean indicating if the chat that has a reply has been deleted from the server or not.
  // This is used to decide if goToChat() should proceed or not
  hasBeenDeleted(repliedChatId: number): boolean {

    // returns true if chat with repliedChatId couldn't be found in the chatMessages array
    return this.chatMessages.findIndex(c => c.id === repliedChatId) < 0;


  }

  // returns the name of a user who deleted a given chat
  public chatDeleter(chat: ChatMessage): string {

    if (chat.deleterId === this.currentUser?.id) return `deleted by you`;
    else if (chat.deleterId === this.groupAdminId) return `deleted by admin`;

    return `deleted by ${chat.deleter!}`;
  }


  // scrolls to the original chat has a reply
  goToChat(chatId: number) {



    // get the index position of the chat 
    const index = this.chatMessages.findIndex(chat => chat.id === chatId);
    // go the elementRef at the given index
    if (index >= 0) {

      // get the element at this index of the querry list
      const element = this.chatMessageRefs.toArray()[index].nativeElement as HTMLElement;

      if (element) {



        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });


        element.classList.add('animated-highlight');

        setTimeout(() => {

          element.classList.remove('animated-highlight')

        }, 10000);
      }
    }
  }

  // checks if the logged in user is the group admin
  isGroupAdmin(): boolean {



    return this.groupAdminId === this.currentUser?.id;
  }

  // validates chat message to enable or disable the sent button
  validateChatContent(): boolean {

    return this.newChatContent.trim().length === 0;



  }



  clearRequestNotification(notificationId?: number) {

    if (notificationId) {

      const index = this.requestNotifications.findIndex(req => req.id = notificationId);

      if (index >= 0) {

        this.requestNotifications.splice(index, 1);
      }
    }


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

    if(this.currentUser){
      this.chatService.deleteChatNotifications(this.currentUser.id, notificationIds).subscribe({

        complete: () => {
  
          for (let index = 0; index < notificationIds.length; index++) {
  
            this.newMemberNotifications.splice(index, 1);
  
          }
        }
  
      })
    }
  }

  // checks if the user is forbidden from posting to the group chat referenced by the ID.
  // Once a user leaves a group chat, they should immediately be prevented from posting to the group chat without the need
  // to refresh the page to update group member counts
  canPost(): boolean {


    if (this.groupId && sessionStorage.getItem('forbidden') !== null) {

      return Number(sessionStorage.getItem('forbidden')) !== this.groupId;
    }
    return true;

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

export function isChatMessage(data: any): data is ChatMessage {

  return (
    typeof data.content === 'string' && typeof data.groupId === 'number'
  )
}
