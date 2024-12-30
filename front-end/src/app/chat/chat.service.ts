import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Endpoints } from '../end-point';
import { defer, Observable, of, Subject, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { _Notification as _Notification } from '../admin/upload/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {



  // Arbitrary content for deleted chats
  private DELETEDCHATCONTENT = '$2a$10$IFch8ji5EgMhuOQdBjdIE.tzyvQbtCEdHSsujbSUALasTHPA87GwO';


  private reconnectionTiming: any;
  private loginSub?: Subscription;

  // map of key , groupId and value Event source
  private eventSources: Map<number, EventSource> = new Map();

  public chatMessageSubjects: Map<number, Subject<ChatMessage>> = new Map();

  public chatNotificationSubjects: Map<number, Subject<_Notification>> = new Map();

  // limit SSE connections to just 5 concurrently
  private maxConnections = 5;

  private _activeGroups:number[] = [];

  // keeps try of the number of reconnection counts when server sent event connection is lost
  private retryCount = 0;




  // message chat observable that emits chats
  private chatSubject = new Subject<ChatMessage>();

  chatMessages$ = this.chatSubject.asObservable();


  // observable that emits notifications such as request to join a group chat
  private joinGroupRequest = new Subject<_Notification>();

  joinGroupRequest$ = this.joinGroupRequest.asObservable();

  // emits the id for the group which has been activated at the component level
  // when it emits a negative number value, it shows the group has been deactivated and another group activated
  private _backgroundChatUpdate = new Subject<number>()

  backgroundUpdate$ = this._backgroundChatUpdate.asObservable();

  // chat background update subscription
 private backgroundSubscriptions = new Map<number, Subscription>();

 _backgroundSubscriptions?:Subscription;


  constructor(private endpoints: Endpoints,
    private http: HttpClient, private zone: NgZone, private authService: AuthService) {

    // disconnect from receiving chat messages once the user logs out
    this.loginSub = this.authService.studentLoginObs$.subscribe(isLoggedIn => {

      if (!isLoggedIn) this.disconnectAllChatGroups();

      else this.performBackgroundChatUpdate();
    });


  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }

  createGroupChat(dto: any): Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.endpoints.createGroupChatUrl, dto, { observe: 'response' });
  }

  // returns all the id for the groups the student already belongs to
  myGroupIds(studentId: number): Observable<number[]> {

    return this.http.get<number[]>(`${this.endpoints.myGroupIdsUrl}?studentId=${studentId}`)

  }
  // communicates to the server endpoint to fetch to fetch unread chats count for the given student
  // Unread chats count is a map object having the group's id as the key, and count of unread messages(greater than or zero) as the values
  groupInfo(studentId: number): Observable<any> {

    return this.http.get<any>(`${this.endpoints.groupInfoUrl}?studentId=${studentId}`);

  }


  // fetch all the group chats from the server
  fetchGroupChats(): Observable<GroupChatInfo> {

    return this.http.get<GroupChatInfo>(this.endpoints.allGroupsUrl);
  }

  // send new chat messages to the server which then broadcasts the chats in realtime to all members online
  sendNewChatMessage(newChat: ChatMessage): Observable<HttpResponse<number>> {

    console.log(`sending ${JSON.stringify(newChat, null, 1)}`)




    return this.http.post<HttpStatusCode>(this.endpoints.newChatMessageUrl, newChat, { 'observe': 'response' })



  }

  sendJoinRequest(joinGroupRequest: GroupJoinRequest): Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.endpoints.joinRequestUrl, joinGroupRequest, { 'observe': 'response' })

  }

  // calls the server side to approvide user's requst to join the group chat referenced by groupId.
  // requesterId is the ID to points to the user that actually requested to join the groupchat
  approveJoinRequest(groupId: number, requesterId: number, requestId: number): Observable<HttpResponse<number>> {



    return this.http.post<HttpStatusCode>(`${this.endpoints.approveRequestUrl}?id=${requestId}`, { [groupId]: requesterId }, { 'observe': 'response' })



  }

  // calls the server to decline user's request to join the group chat
  declineJoinRequest(groupId: number, studentId: number, notificationId: number): Observable<HttpResponse<number>> {

    return this.http.get<HttpStatusCode>(`${this.endpoints.declineJoinRequestUrl}?grp=${groupId}&stu=${studentId}&notice_id=${notificationId}`, { 'observe': 'response' });


  }



  // method that deletes the given join request notification referenced by the notification ID
  deleteChatNotifications(studentId: number, notificationIds: number[]): Observable<void> {

    return this.http.delete<void>(`${this.endpoints.deleteChatNotificationsUrl}?owner_id=${studentId}`, {
      headers: new HttpHeaders({ 'content-type': 'application/json' }),
      body: notificationIds
    })



  }

  // fetches all the group chats the user has once requested to join, which have yet to receive approval or disapproval
  getPendingGroupChatRequestsFor(studentId: number): Observable<number[]> {

    return this.http.get<number[]>(`${this.endpoints.pendingGroupChatRequestsUrl}?studentId=${studentId}`)



  }


  hadPreviousPosts(studentId: number, groupId: number): Observable<boolean> {

    const data: { [studentId: number]: number } = { [studentId]: groupId }

    return this.http.post<boolean>(`${this.endpoints.anyRecentPosts}`, data)

  }

  // method that establishes a unidirectional messaging system where the server forwards previous chat messages to the client via the server sent event emitter client
  connectToChatMessages(groupId: number, studentId: number) {

       //  create new event source for the group if there was non
    if (this.eventSources.has(groupId)) {

      // close the least recently used connection
      if(this._activeGroups.length >= this.maxConnections){

        const oldConnection = this._activeGroups.shift();

        if(oldConnection){

          this.disconnectFromGroup(groupId);

          this.disconnectFromServer(oldConnection, studentId);
        }

      }

    }else{


      if(!this.chatNotificationSubjects.has(groupId)){
        // create new notification subject
        this.chatNotificationSubjects.set(groupId, new Subject<_Notification>());
      }
              // create a new Subject
              if(!this.chatMessageSubjects.has(groupId)){
               
              

                this.chatMessageSubjects.set(groupId, new Subject<ChatMessage>());

              }
      // create new event source for the group
      const eventSource = new EventSource(`${this.endpoints.chatMessagesUrl}?group=${groupId}&student=${studentId}`);

      // add the event source to the map of event sources
      this.eventSources.set(groupId, eventSource);



      eventSource.addEventListener('chats', (event: MessageEvent<any>) => {
        this.zone.run(() => {

          // check if any message has been received
          if (event) {
            const data = JSON.parse(event.data);
 

            // process for the case where the message a request to join the group chat
            if (this.isJoinGroupRequest(data)) {

                      

             

              // emit current chat notification to subscribers
              this.chatNotificationSubjects.get(groupId)!.next(data);


            }  //process for the case of chat message
            else if (this.isChatMessages(data)) {

              
              //  emits new chat message to suscribers
              this.chatMessageSubjects.get(groupId)!.next(data);

            }
           
          }
        });

             });

              //  disconnect group from notifications on account of error
        eventSource.onerror = () => {

          console.log(`event source error`)

          // disconnect the erring group
          this.disconnectFromGroup(groupId);

          // retry network connection

          const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

          this.retryCount++;
          this.reconnectionTiming = setTimeout(() => {

            console.log('reconnecting to chat')

            this.connectToChatMessages(groupId, studentId);
          }, retryDelay);

        };

        //  reset retry count once connected
        eventSource.onmessage = () => {
          console.log('connected to chats');
          this.retryCount = 0;
        }



    }

   
  }

  // streams chat messages for the given group referenced by its ID
  public streamChatMessagesFor(groupId:number):Observable<ChatMessage | undefined>{


    return defer(() => {

      const message = this.chatMessageSubjects.get(groupId);

      return message ? this.chatMessageSubjects.get(groupId)!.asObservable() : of(undefined);
    })

   

  //  return this.chatMessageSubjects.get(groupId) ? this.chatMessageSubjects.get(groupId)!.asObservable() : of(undefined)
  }

  // special method that get notified when message for a given group are recieved. The group must have been unssubscribed from the component
  // due to the user visiting another group they belong to. In order to still keep getting realtime messages, this method only performs background
  //chat updates for the group which has been unsubscribed from observable when chats arrive.
  private performBackgroundChatUpdate(){

  this._backgroundSubscriptions =   this.backgroundUpdate$.subscribe((groupId:number) => {

      // subscribe to get chat messages since the user has clicked to different group at the component level
      if(groupId){

       
          // unsubscribe from previous subscription if there's any to avoid memory leak
          this.backgroundSubscriptions.get(groupId)?.unsubscribe();

          // replace the subscription with the new one.
            this.backgroundSubscriptions.set(groupId, this.streamChatMessagesFor(groupId).subscribe({

              next:(data:ChatMessage | undefined) => {
    
                if(data){
                  
                  this.addToChats(data);
    
    
                }
    
              }
            }));


      }else if(groupId < 0) {

        console.log(`unsubscribing ${groupId}`)

        // unsubscribe unsubscribe this group from background chat updates since the group actively routed to in the component
        this.backgroundSubscriptions.get((-1 * groupId))?.unsubscribe();
      }
    })

  }

  private addToChats(incomingChat: ChatMessage) {

    console.log(`background chat ${JSON.stringify(incomingChat, null, 1)}`)

    let savedChats = this.getMessagesFromSession(incomingChat.groupId);

    switch (incomingChat.content) {
      case this.DELETEDCHATCONTENT:

      // delete the message from savedChats
      savedChats.splice(savedChats.findIndex(c => c.id === incomingChat.id), 1);

      // get replied chats for the deleted chat
      let repliedChats = this.repliers(incomingChat.id!, savedChats);

      if(repliedChats.length){

        for (let index = 0; index < repliedChats.length; index++) {

          //set the name and id of the user that deleted the chat

          repliedChats[index].deleterId = incomingChat.deleterId;
          repliedChats[index].deleter = incomingChat.deleter;
         
        }

        // update the content of saveChats
        repliedChats.forEach(r => {

          savedChats.splice(savedChats.findIndex(c => c.id === r.id), 1, r);
        })
      }
        
        break;
    
      default:

       // search for the chat in the array of savedChats
       const index = savedChats.findIndex(c => c.id === incomingChat.id);

      //  check of the incoming chat is an edited version of a previous chat
      if(index !== -1 && incomingChat.content !== savedChats[index].content){

        savedChats[index].content = incomingChat.content;
        savedChats[index].isEditedChat = true;
      } else if(index === -1){

        // this is the case of a new chat message
        savedChats.push(incomingChat);
      }
    

        break;
    }

   
    // update the session storage
    console.log(`saving the chat`)
    this.saveMessagesToSession(incomingChat.groupId, savedChats);

    console.log(`saved chat: ${JSON.stringify(this.getMessagesFromSession(incomingChat.groupId))}`)


    
  }

  // return an array of chat replies for the chat referenced by id
  repliers(id: number , savedChats: ChatMessage[]):ChatMessage[] {
    

    return savedChats.filter(c => c.repliedTo === id);
  }

  public streamChatNotificationsFor(groupId: number):Observable<_Notification | undefined> {

    return defer(() => {

      const notification = this.chatNotificationSubjects.get(groupId);

      return notification ? this.chatNotificationSubjects.get(groupId)!.asObservable() : of(undefined);
    })


  }
 
  public get backgroundChatUpdate(){

    return this._backgroundChatUpdate;
    
  }

  disconnectFromGroup(groupId: number): any {

    if (this.eventSources.has(groupId)) {

      // close the connection
      this.eventSources.get(groupId)!.close();

      // delete event source from the map of event sources
      this.eventSources.delete(groupId);

      // recalculate active group count
      this._activeGroups = this._activeGroups.filter(id => id !== groupId)
    }


  }

  private get activeUsers(){

    return this._activeGroups
  }

  //save messages to session storage
  saveMessagesToSession(groupId: number, messages: ChatMessage[]): void {

    sessionStorage.setItem(`group_${groupId}_messages`, JSON.stringify(messages));

  }

  // retrieves messages from session storage if there's any, or empty array if there's none
  getMessagesFromSession(groupId: number): ChatMessage[] {

    const data = sessionStorage.getItem(`group_${groupId}_messages`);

    return data ? (JSON.parse(data) as Array<ChatMessage>) : [];
  }

  // provides mechanism for sorting chat messages by date
  private byDate(): ((a: ChatMessage, b: ChatMessage) => number) | undefined {

   
    return (a, b) => {

      


      if ((a.sentAt as Date).getTime() > (b.sentAt as Date).getTime()) return 1;
      if ((a.sentAt as Date).getTime() < (b.sentAt as Date).getTime()) return -1;
      return 0;
    };
  }

  // deletes a given chat message whose groupId is the key and chatId is the value of the map
  deleteChatMessage(map: { [x: number]: number }, deleterId: number): Observable<HttpResponse<number>> {


    return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteChatUrl}?del_id=${deleterId}`, {
      body: map,
      observe: "response"
    })

  }


  // disconnect the user from all the group when they log out
  disconnectAllChatGroups() {

    console.log(`logging out active users ${this.activeUsers}`)

    if (this.eventSources) {

    

      this.eventSources.forEach((_, groupId) => this.disconnectFromGroup(groupId!))



      clearTimeout(this.reconnectionTiming);

      // disconnect all active groups from the server
      this.disconnectFromServer();
    }

    // disconnect all chat groups from the server's SSE

  }

  public disconnectFromServer(groupId?:number, studentId?:number, activeGroups?:number[]):Observable<HttpResponse<number>>{

    const map = new Map<number, number>();


    if(groupId && studentId){

      map.set(groupId, studentId);
    }else {

      const _activeGroups = this.activeUsers;

      console.log(`logging out all groups ${this.activeUsers}`)

      _activeGroups.forEach(group => map.set(group, this.loggedInStudentId));
    }

    return this.http.post<HttpStatusCode>(this.endpoints.disconnectUrl, map,{observe:'response'});


  }

  private get loggedInStudentId(){

    return Number(sessionStorage.getItem('studentId'));
  }



 

  // checks if the new notification received is a request to join group chat or about new member that has just joined the group chat
  private isJoinGroupRequest(data: any): data is _Notification {

    return (data as _Notification).notifier !== undefined &&
      ((data as _Notification).type === 'join group' || (data as _Notification).type === 'new member');
  }

  // check if the notification received is chat message
  private isChatMessages(data: any): data is ChatMessage {

    return (data as ChatMessage).onlineMembers !== undefined;
  }


  // implements functionality for editing group chat names
  editGroupName(_studentId: string, groupId: string, currentGroupName: string): Observable<HttpResponse<number>> {


    return this.http.patch<HttpStatusCode>(`${this.endpoints.editGroupUrl}?_new=${currentGroupName}`, { [Number(_studentId)]: Number(groupId) }, { 'observe': 'response' })
  }


  // _studentId is used to verify that it's the group admin who actually wants to delete the group chat
  deleteGroupChat(_studentId: string, groupId: string): Observable<HttpResponse<number>> {



    return this.http.delete<HttpStatusCode>(this.endpoints.deleteGroupUrl, {
      headers: new HttpHeaders({ 'content-type': 'application/json' }),
      observe: 'response',
      body: { [Number(_studentId)]: Number(groupId) }
    })

  }

  leaveGroup(groupId: number, studentId: number): Observable<HttpResponse<number>> {

    return this.http.delete<HttpStatusCode>(this.endpoints.leaveGroupUrl, {

      headers: new HttpHeaders({ 'content-type': 'application/json' }),
      observe: 'response',
      body: { [groupId]: studentId }
    })

  }

  updateChat(editableChat: ChatMessage): Observable<HttpResponse<number>> {




    return this.http.put<HttpStatusCode>(this.endpoints.editChatUrl, editableChat, { observe: 'response' });


  }
}


// a type representing the chat messages for the a given group chat
export type ChatMessage = {

  id?: number,
  groupId: number,
  senderId: number,
  senderName?: string,
  content: string,
  isEditedChat:boolean,
  repliedTo?: number,//ID of the chat that was replied to assuming this was a replied chat
  repliedToChat?: string,//The actual chat message that was replied to if this was a replied chat
  deleterId?: number,//points to the user who deleted a given chat that some replies
  deleter?: string,//name of the user who deleted the chat has some replies
  sentAt: Date,
  onlineMembers?: number//tracks the number of members who are currently online



}

// a key-value pair object representing group chats where the key is the group chat id.
export type GroupChatInfo = {

  [groupId: number]: {
    unreadChats: number, // zero or more unread chats
    groupName: string, // the group chat name
    createdAt: Date, // the date the group was created
    groupIconUrl: string, // the group icon url pointing to the group icon
    groupDescription: string, // the group description which every group chat must have. It portrays their ideology 
    groupAdminId: string, // information pointing the group admin
    hasPreviousPosts: boolean //determines if the group chat previous posts
    isGroupLocked:boolean
  }
}

// object for sending request to join group chats
export type GroupJoinRequest = {

  groupId: string,
  requesterId: string | null,
  groupAdminId: string,
  requestedAt: Date,
  requester: string //the name of the user requesting to join the group chat
}


