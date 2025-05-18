import { effect, inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Endpoints } from '../end-point';
import { connect, defer, Observable, of, Subject, Subscription, take } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService, User } from '../auth/auth.service';
import { _Notification as _Notification } from '../admin/upload/notifications/notifications.service';
import { ChatCacheService } from './chat-cache.service';
import { EventSourcePolyfill } from 'ng-event-source';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ChatService {



  // Arbitrary content for deleted chats
  private DELETEDCHATCONTENT = '$2a$10$IFch8ji5EgMhuOQdBjdIE.tzyvQbtCEdHSsujbSUALasTHPA87GwO';


  private reconnectionTiming: any;
  

  // map of key , groupId and value Event source
  private eventSources: Map<number, EventSourcePolyfill> = new Map();

  public chatMessageSubjects: Map<number, Subject<ChatMessage>> = new Map();

  public chatNotificationSubjects: Map<number, Subject<_Notification>> = new Map();

  // limit SSE connections to just 5 concurrently
  private maxConnections = 5;

  private _activeGroups: number[] = [];

  // keeps try of the number of reconnection counts when server sent event connection is lost
  private retryCount = 0;


  //initial retry backoff time of 1sec
  private retryDelay = 45000;

  private MAX_RECONNECTION_ATTEMPT = 10; //Only after 10 unsuccessful reconnection attempts would the cient stop further attempts

  private reconnectionAttempt = 0; //tracks the number of attempts at re-establishing connection




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

  _backgroundSubscriptions?: Subscription;

  
  private userId?:number;
 
  private endpoints = inject(Endpoints);
  private chatCachedService = inject(ChatCacheService);;
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  private currentUser = toSignal(this.authService.loggedInUserObs$);

  private eventListeners =  new Map<number, {chats:EventListener, heartbeat:EventListener} >();
  



  constructor() {

    effect(() => {

      this.currentUser() ? this.performBackgroundChatUpdate() : this.disconnectAllChatGroups();
     
      // one-time subscription to get the userId
      this.userId === undefined ? this.currentUser()?.id : this.userId;
    })
    

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
  groupInfo(studentId: number): Observable<Map<number, GroupChatInfo>> {

    return this.http.get<Map<number, GroupChatInfo>>(`${this.endpoints.groupInfoUrl}?studentId=${studentId}`);

  }


  // fetch all the group chats from the server
  fetchGroupChats(): Observable<Map<number, GroupChatInfo>> {

    return this.http.get<Map<number, GroupChatInfo>>(this.endpoints.allGroupsUrl);
  }

  // send new chat messages to the server which then broadcasts the chats in realtime to all members online
  sendNewChatMessage(newChat: ChatMessage): Observable<HttpResponse<number>> {



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

    console.log('Connecting to chat messages...');

    // cleanup existing connection
    this.disconnectFromGroup(groupId);

   


      if (!this.chatNotificationSubjects.has(groupId)) {
        // create new notification subject
        this.chatNotificationSubjects.set(groupId, new Subject<_Notification>());
      }
      // create a new Subject
      if (!this.chatMessageSubjects.has(groupId)) {


        console.log('Creating new chat message subject...');

        this.chatMessageSubjects.set(groupId, new Subject<ChatMessage>());

      }
      // create new event source for the group
      const eventSource = new EventSourcePolyfill(`${this.endpoints.chatMessagesUrl}?group=${groupId}&student=${studentId}`, {

        headers: {
          'authorization': `Bearer ${this.currentUser()?.accessToken}`,
        },
        heartbeatTimeout: this.retryDelay,
        connectionTimeout: 5000
      });

      // add the event source to the map of event sources
      this.eventSources.set(groupId, eventSource);

      this._activeGroups.push(groupId);


      // sets up hearbeat event listener
      const chatListener =  (event: Event) => {
        this.zone.run(() => {

          const messageEvent = event as MessageEvent;

          // check if any message has been received
          if (messageEvent) {


            const data = JSON.parse(messageEvent.data);


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

      };

      // listen for heartbeat event
      const heartbeatListener = (event:Event) => {

        this.zone.run(() => {

          this.retryDelay = 35000;
          this.retryCount = 0;
        })
      }


     eventSource.addEventListener('heartbeat', heartbeatListener);


      eventSource.addEventListener('chats', chatListener);


      this.eventListeners.set(groupId, {chats: chatListener, heartbeat: heartbeatListener});

      


      //  disconnect group from notifications on account of error
      eventSource.onerror = (error:Event) => {

        console.log(`error occurred: ${JSON.stringify(error)}`);

        this.zone.run(() => {

        
          if(error.type !== 'abort'){

            this.reconnectToServer(groupId, studentId);
          }
        })




      };

      //  reset retry count once connected
      eventSource.onmessage = () => {
       
        this.retryCount = 0;

        this.retryDelay = 35000
      }







    }


  

  private reconnectToServer(groupId: number, studentId: number) {

    this.disconnectFromGroup(groupId);

    // calculate delay with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.retryCount),60000);   

    // schedule reconnection
    setTimeout(() => {
      
      if(this.reconnectionAttempt < this.MAX_RECONNECTION_ATTEMPT){

        this.connectToChatMessages(groupId, studentId);
        this.reconnectionAttempt++;

      }

    }, delay);


  }

  // streams chat messages for the given group referenced by its ID
  public streamChatMessagesFor(groupId: number): Observable<ChatMessage | undefined> {


    return defer(() => {

      const message = this.chatMessageSubjects.get(groupId);

      return message ? this.chatMessageSubjects.get(groupId)!.asObservable() : of(undefined);
    })



    //  return this.chatMessageSubjects.get(groupId) ? this.chatMessageSubjects.get(groupId)!.asObservable() : of(undefined)
  }

  // special method that get notified when message for a given group are recieved. The group must have been unssubscribed from the component
  // due to the user visiting another group they belong to. In order to still keep getting realtime messages, this method only performs background
  //chat updates for the group which has been unsubscribed from observable when chats arrive.
  private performBackgroundChatUpdate() {

    this._backgroundSubscriptions = this.backgroundUpdate$.subscribe((groupId: number) => {

      // subscribe to get chat messages since the user has clicked to different group at the component level
      if (groupId) {


        // unsubscribe from previous subscription if there's any to avoid memory leak
        this.backgroundSubscriptions.get(groupId)?.unsubscribe();

        // replace the subscription with the new one.
        this.backgroundSubscriptions.set(groupId, this.streamChatMessagesFor(groupId).subscribe({

          next: (data: ChatMessage | undefined) => {

            if (data) {

              this.addToChats(data);


            }

          }
        }));


      } else if (groupId < 0) {

      

        // unsubscribe unsubscribe this group from background chat updates since the group actively routed to in the component
        this.backgroundSubscriptions.get((-1 * groupId))?.unsubscribe();
      }
    })

  }

  private async addToChats(incomingChat: ChatMessage) {

    let savedChats = await this.getCachedChats(incomingChat.groupId);

    switch (incomingChat.content) {
      case this.DELETEDCHATCONTENT:

        // delete the message from savedChats
        savedChats.splice(savedChats.findIndex(c => c.id === incomingChat.id), 1);

        // get replied chats for the deleted chat
        let repliedChats = this.repliers(incomingChat.id!, savedChats);

        if (repliedChats.length) {

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
        if (index !== -1 && incomingChat.content !== savedChats[index].content) {

          savedChats[index].content = incomingChat.content;
          savedChats[index].isEditedChat = true;
        } else if (index === -1) {

          // this is the case of a new chat message
          savedChats.push(incomingChat);
        }


        break;
    }


    // update the session storage

    this.cachedMessage(incomingChat.groupId, savedChats);

  }

  // return an array of chat replies for the chat referenced by id
  repliers(id: number, savedChats: ChatMessage[]): ChatMessage[] {


    return savedChats.filter(c => c.repliedTo === id);
  }

  public streamChatNotificationsFor(groupId: number): Observable<_Notification | undefined> {

  

    return defer(() => {

      const notification = this.chatNotificationSubjects.get(groupId);

      return notification ? this.chatNotificationSubjects.get(groupId)!.asObservable() : of(undefined);
    })


  }

  public get backgroundChatUpdate() {

    return this._backgroundChatUpdate;

  }

  disconnectFromGroup(groupId: number): void {
    if (this.eventSources.has(groupId)) {
      const eventSource = this.eventSources.get(groupId);
      
      if (eventSource) {
        // Remove all listeners
        const listeners = this.eventListeners.get(groupId);
        if (listeners) {
          eventSource.removeEventListener('chats', listeners.chats);
          eventSource.removeEventListener('heartbeat', listeners.heartbeat);
          this.eventListeners.delete(groupId);
        }
        
        // Nullify callbacks
        eventSource.onerror = ()=>{};
        eventSource.onmessage = ()=>{};
        
        // Close connection
        eventSource.close();
      }
      
      // Clean up maps
      this.eventSources.delete(groupId);
      this._activeGroups = this._activeGroups.filter(id => id !== groupId);
    }
  }
  private get activeUsers() {

    return this._activeGroups
  }

  //save messages to indexedDb storage
  async cachedMessage(groupId: number, messages: ChatMessage[]) {

    await this.chatCachedService.saveChat(`${groupId}`, messages)

  }

  // retrieves messages from session storage if there's any, or empty array if there's none
  getCachedChats(groupId: number) {

    return this.chatCachedService.getCachedChat(`${groupId}`)
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


    if (this.eventSources) {



      this.eventSources.forEach((_, groupId) => this.disconnectFromGroup(groupId!))



      clearTimeout(this.reconnectionTiming);

      // disconnect all active groups from the server
      this.disconnectFromServer();
    }

    // disconnect all chat groups from the server's SSE

  }

  public disconnectFromServer(studentId?: number, groupId?: number): Observable<HttpResponse<number>> {

    const map = new Map<number, number>();


    if (groupId && studentId) {

      map.set(studentId, groupId);
    } else {

      const _activeGroups = this.activeUsers;


      if(this.userId){
        _activeGroups.forEach(group => map.set(this.userId!, group, ));
      }
     
    }

    return this.http.post<HttpStatusCode>(this.endpoints.disconnectUrl, map, { observe: 'response' });


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
  isEditedChat: boolean,
  repliedTo?: number,//ID of the chat that was replied to assuming this was a replied chat
  repliedToChat?: string,//The actual chat message that was replied to if this was a replied chat
  deleterId?: number,//points to the user who deleted a given chat that some replies
  deleter?: string,//name of the user who deleted the chat has some replies
  sentAt: Date,
  onlineMembers?: number//tracks the number of members who are currently online



}

// a key-value pair object representing group chats where the key is the group chat id.
export type GroupChatInfo = {

   
    unreadChats: number, // zero or more unread chats
    groupName: string, // the group chat name
    createdAt: Date, // the date the group was created
    groupIconUrl: string, // the group icon url pointing to the group icon
    groupDescription: string, // the group description which every group chat must have. It portrays their ideology 
    groupAdminId: string, // information pointing the group admin
    hasPreviousPosts: boolean //determines if the group chat previous posts
    isGroupLocked: boolean
  
}

// object for sending request to join group chats
export type GroupJoinRequest = {

  groupId: string,
  requesterId: string | null,
  groupAdminId: string,
  requestedAt: Date,
  requester: string //the name of the user requesting to join the group chat
}


