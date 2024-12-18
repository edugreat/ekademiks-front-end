import { Component, ElementRef, Inject, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatMessage, ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { _Notification as _Notification } from '../../admin/upload/notifications/notifications.service';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.css'
})
export class GroupChatComponent implements OnInit, OnDestroy {



  // Arbitrary content for deleted chats
  private  DELETEDCHATCONTENT ='$2a$10$IFch8ji5EgMhuOQdBjdIE.tzyvQbtCEdHSsujbSUALasTHPA87GwO';



  fontSize = '10px';

  currentlyClickedChat?: ChatMessage;

  // holds reference to the list of elements in the #chatMessageRef
  @ViewChildren('chatMessageRef') chatMessageRefs!:QueryList<ElementRef>;

  @ViewChild('textAreaDiv') textAreaDiv!:ElementRef<HTMLDivElement>;

  @ViewChild('textarea') textArea!:ElementRef<HTMLTextAreaElement>

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

  private chatSubscription?: Subscription;

  private joinRequestSub?: Subscription;

  newChatContent: string = '';

  // an array of both previous and current chat messages belonging to this group chat
  chatMessages: ChatMessage[] = [];




  groupId?: number; //the group ID of this group chat

  groupDescription?: string; //the group description every group must have, which idealy defines their ideology

  private _snackBar = inject(MatSnackBar);

  snackBarTimer: any;


  @ViewChild('chatContainer') chatContainer!: ElementRef;




  constructor(private chatService: ChatService, private activatedRoute: ActivatedRoute) { }



  ngOnInit(): void {


    this.activatedRoute.paramMap.subscribe(params => {

     



      const _groupId = params.get('group_id');
      const groupDescription = params.get('description');


      if (_groupId && groupDescription) {
        this.groupId = Number(_groupId);

        this.groupDescription = groupDescription;

        // populate the chatMessages with the group's buffered chats(if exists)
        this.chatMessages = [];
        this.chatMessages = this.getChatBuffer(Number(_groupId));


        this.chatService.groupChatUpdates(Number(_groupId), this.loggedInStudentId());

        // checks if the user had recent messages
        this.hadRecentPosts();

       

        this.streamChats();

      }
    })

    this.joinRequestNotification();



  }



  ngOnDestroy(): void {

    this.chatSubscription?.unsubscribe();
    this.joinRequestSub?.unsubscribe();
    clearInterval(this.snackBarTimer);

    // disconnect from the receiving chat messages
    this.chatService.disconnectFromSSE();
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

  // persist chat messages to the session storage to show instant messages without waiting for server's response when the 
  // user navigates between groupchats
  private bufferMessages(messages:ChatMessage[]){

 
    // checks if there are buffers in the storage
    if(sessionStorage.getItem('chatBuffer')){

      let chatBufferObjs = JSON.parse(sessionStorage.getItem('chatBuffer')!);

      let chatBuffers:Map<number, ChatMessage[]> = new Map<number, ChatMessage[]>(

        Object.entries(chatBufferObjs).map(([key, value]) => [Number(key), value as ChatMessage[]])
      );

      chatBuffers.set(messages[0].groupId, messages);

      sessionStorage.setItem('chatBuffer', JSON.stringify(Object.fromEntries(chatBuffers)));
    }else{

      let _buffer = new Map<number, ChatMessage[]>();
      _buffer.set(messages[0].groupId, messages);

      sessionStorage.setItem('chatBuffer', JSON.stringify(Object.fromEntries(_buffer)));
     
    }

  
  }

  // get the buffered chats for the given group id
  private getChatBuffer(groupId:number):ChatMessage[]{

    if(sessionStorage.getItem('chatBuffer')){

      const chatBuffersObj = JSON.parse(sessionStorage.getItem('chatBuffer')!);

      let chatBuffers:Map<number, ChatMessage[]> = new Map<number, ChatMessage[]>(

        Object.entries(chatBuffersObj).map(([key, value]) => [Number(key), value as ChatMessage[]])
      );

      let chats:ChatMessage[] = chatBuffers.get(groupId) || [];

      if(chats.length) return chats.filter(c => c.groupId === groupId);
    }

    return [];


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

  private scrollToTextArea(){

   const element =  this.textAreaDiv.nativeElement;

   element.scrollIntoView({
    block:'end',behavior:'smooth'
  });

  if(this.textArea){

    this.textArea.nativeElement.focus({preventScroll:true})
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
    if(this.currentlyClickedChat){

      this._replyToChat = true;

      this.newChatContent = `Your reply...`;
     this.scrollToTextArea();
      
    }

  
    }
    

  deleteChat() {

    // only the chat author or the group admin is permitted to delete the chat
    if(this.currentlyClickedChat?.senderId === this.loggedInStudentId() || this.isGroupAdmin() ){

      this.chatService.deleteChatMessage({[this.currentlyClickedChat!.groupId]:this.currentlyClickedChat!.id!})
      .pipe(take(1)).subscribe({

        next:(response:HttpResponse<number>) => {

          if(response.status === HttpStatusCode.Ok){

            // remove the chat from the array of chats
            const index = this.chatMessages.findIndex(msg => msg.id === this.currentlyClickedChat?.id);

            if(index >= 0){

              this.chatMessages.splice(index, 1);
            }
          }
        }
      })


    }


  }

  // checks if the logged in was the sender of the chat message
  isAuthor(): boolean {

    if (this.currentlyClickedChat) {

      return this.loggedInStudentId() === this.currentlyClickedChat.senderId;
    }

    return false;


  }


  // get the number of online members from the session storage
  get onlineMembers(): number | undefined {

    const currentlyOnline = sessionStorage.getItem('online_members');



    return currentlyOnline ? Number(currentlyOnline) : undefined


  }

  // adds a chat to the array of chatMessages, if the current chat is not already in the array
  private addToChats(chat: ChatMessage) {




    const index = this.chatMessages.findIndex(c => c.id === chat.id);
    if (index >= 0) {


      let updatableChat = this.chatMessages[index];

     
      // check if it's a deleted chat
      if (chat.content === this.DELETEDCHATCONTENT) {

        this.chatMessages.splice(index, 1);

        this.bufferMessages(this.chatMessages);

      }
       // replace the old chat with the new chat since it's an updated version of the chat message
      else if(chat.content !== updatableChat.content){

        console.log('calling else if{}')

        updatableChat.content = chat.content;

        this.bufferMessages(this.chatMessages);

       
      }


    } else { //this is a new chat message

      console.log('calling else{} for new chat message')


      this.chatMessages.push(chat);

      this.bufferMessages(this.chatMessages);

      // scrolls to the bottom
      setTimeout(() => {
        this.scrollToBottom()
      }, 0);

      // update online presence of members
      sessionStorage.setItem('online_members', `${chat.onlineMembers}`);

      return;
    }

    sessionStorage.setItem('online_members', `${chat.onlineMembers}`);
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

    const studentId = sessionStorage.getItem('studentId');

    if (studentId && this.groupId) {

      this.chatService.hadPreviousPosts(Number(studentId), this.groupId).pipe(take(1)).subscribe({
        next: (result) => {
          if (result) {
            sessionStorage.setItem('recentPosts', 'true');
          }
        }
      })

    }

  }

  joinedAt(): Date {

    const _joinedAt = JSON.parse(sessionStorage.getItem('joinedAt')!);



    return new Date(_joinedAt[this.groupId!]);


  }

  recentPosts(): boolean {

    return (sessionStorage.getItem('recentPosts') ? true : false)
  }

  loggedInStudentId(): number {

    const id = Number(sessionStorage.getItem('studentId'));

    return id;
  }

  // triggers sending new chat messages to the group
  sendChat() {


    const senderId = sessionStorage.getItem('studentId');
    if (this.groupId && senderId && this.newChatContent.trim().length) {



      // handle differently for the case of chat editing
      if (this.currentlyClickedChat && this.editingChat) {

        // get the chat message being edited
        let editableChat = this.chatMessages.find(chat => chat.id === this.currentlyClickedChat!.id);
        const editedChatIndex = this.chatMessages.findIndex(chat => chat.id === this.currentlyClickedChat!.id);
        if (editableChat) {

          //    // update the content of the chat
          // editableChat!.content = this.newChatContent;

          const updatedChat: ChatMessage = {
            id: editableChat.id,
            groupId: editableChat.groupId,
            senderId: editableChat.senderId,
            content: this.newChatContent,
            sentAt: editableChat.sentAt

          }

          this.chatService.updateChat(updatedChat).pipe(take(1)).subscribe({
            next: (response: HttpResponse<number>) => {

              if (response.status === HttpStatusCode.Ok) {


                // replace existing chat with the edited chat
                editableChat!.content = this.newChatContent;

                this.newChatContent = '';

              }


            },
            error: (err) => {
              console.log(`could not edit chat`);

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
      }else if(this.currentlyClickedChat && this._replyToChat){

        const newChatMessage: ChatMessage = {
          id: 0,//not actually a required field, but to prevent server reporting error 
          groupId: Number(this.groupId),
          senderId: Number(senderId),
          senderName: '',//not actually a required field, but to prevent server reporting error 
          content: this.newChatContent,
          repliedTo:this.currentlyClickedChat.id,
          repliedToChat:this.currentlyClickedChat.content,
          sentAt: new Date()
        };

        this.newChatContent = '';

        this._replyToChat = false;

        this.chatService.sendNewChatMessage(newChatMessage).pipe(take(1)).subscribe({
          next: (response: HttpResponse<number>) => {
            if (response.status === HttpStatusCode.Ok) console.log('message sent')
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
          senderId: Number(senderId),
          senderName: '',//not actually a required field, but to prevent server reporting error 
          content: this.newChatContent,
          sentAt: new Date()
        };

        this.newChatContent = '';


        this.chatService.sendNewChatMessage(newChatMessage).subscribe({
          next: (response: HttpResponse<number>) => {
            if (response.status === HttpStatusCode.Ok) console.log('success')
          },

          error: (err) => console.log(err)
        })

        
      }


    }

  }

  // returns boolean indicating if the chat that has the reply has been deleted from the server or not.
  // This is used to decide if goToChat() should proceed or not
  hasBeenDeleted(repliedChatId:number):boolean{

    // get the id if the replied chat
    const _repliedChatId = this.chatMessages.filter(c => c.id === repliedChatId)[0].repliedTo;

    // check if chat with _repliedChatId still exists in the chat messages array

    return this.chatMessages.filter(chat => chat.id === _repliedChatId)[0] === null;


  }

// scrolls to the original chat has a reply
goToChat(chatId:number) {
  
  const x = this.chatMessages.filter(c => c.id === chatId)[0];

  console.log(JSON.stringify(x, null, 1))
 

  // get the index position of the chat 
  const index = this.chatMessages.findIndex(chat => chat.id === chatId);
  // go the elementRef at the given index
  if(index >= 0 && !this.hasBeenDeleted(chatId)){

    // get the element at this index of the querry list
    const element = this.chatMessageRefs.toArray()[index].nativeElement as HTMLElement;

    if(element){

      console.log(`element: ${JSON.stringify(element, null, 1)}`)

      element.scrollIntoView({behavior:'smooth',block:'nearest'});
    

      element.classList.add('animated-highlight');

      setTimeout(() => {
        
        element.classList.remove('animated-highlight')

      }, 10000);
    }
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



  clearRequestNotification(notificationId?: number) {

    if (notificationId) {

      const index = this.requestNotifications.findIndex(req => req.id = notificationId);

      if (index >= 0) {

        this.requestNotifications.splice(index, 1);
      } else {
        console.log(`could not find index: ${index}`)
      }
    } else console.log(`notification is undefined:`)


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

      complete: () => {

        for (let index = 0; index < notificationIds.length; index++) {

          this.newMemberNotifications.splice(index, 1);

        }
      }

    })
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

