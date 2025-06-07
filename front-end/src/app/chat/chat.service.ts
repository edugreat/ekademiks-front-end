import { effect, inject, Injectable, NgZone, signal } from '@angular/core';
import { Endpoints } from '../end-point';
import { BehaviorSubject, defer, map, Observable, of, Subject, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService, User } from '../auth/auth.service';
import { _Notification as _Notification } from '../admin/upload/notifications/notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { LogoutDetectorService } from '../logout-detector.service';
import { LivePresenceMonitorService } from '../live-presence-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {



  


  private abortContoller:AbortController | null = null;
  private messageUrl = 'http://localhost:8080/chats/messages';

  
  // stores a user chat messages. Key is the user ID, value is a map of which key is the group id and value, an observable that emits chat messages per group
  public chatMessageSubjects: Map<number, Map<number, BehaviorSubject<ChatMessage[] | ChatMessage>>> = new Map();

  // emits to subscribers(at the cache service), a user ID and array of group IDs, so they can begin to listen to SSE chat messages for the given user for a given chat group
  public chatConnectionSignal = signal<Map<number, number[]>>(new Map<number, number[]>());
// emits to subscribers(at the cache service), a user ID and group ID, so they can begin to listen to SSE notification messages for the given user for a given chat group
  public notificationConnectionSignal = signal<Map<number, number[]>>(new Map<number, number[]>());

  // key is the studentId, value is a map of which key is the groupId and value, an observable that emits notifications per group
  public chatNotificationSubjects: Map<number, Map<number, BehaviorSubject<_Notification[]>>> = new Map();

  private logoutDetectorService = inject(LogoutDetectorService);
  private livePresenceMonitorService = inject(LivePresenceMonitorService);


  
  retryCount = 0;
  maxRetries = 25;
  baseDelay = 1000;
  
  



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


  _backgroundSubscriptions?: Subscription;

  
  private userId?:number;
 
  private endpoints = inject(Endpoints);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  private currentUser = toSignal(this.authService.loggedInUserObs$);

  



  constructor() {

    effect(() => {

     if(!this.currentUser()) this.disconnectFromSSE();
     
      // one-time subscription to get the userId
      this.userId = this.currentUser()?.id;
    })
    
    // disconnect fetch event source when the user logs out
    effect(() => this.logoutDetectorService.isLogoutDetected()  ? this.disconnectFromSSE(): '')

  }


  createGroupChat(dto: any): Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.endpoints.createGroupChatUrl, dto, { observe: 'response' });
  }

  // returns all the id for the groups the student already belongs to
  myGroupIds(studentId: number): Observable<number[]> {

    return this.http.get<number[]>(`${this.endpoints.myGroupIdsUrl}?studentId=${studentId}`)

  }


  // fetch information about all the group chats the student belongs to.
  // key is the groupId and value is the group chat information
  groupInfo(studentId: number): Observable<Map<number, GroupChatInfo>> {

    return this.http.get<any>(`${this.endpoints.groupInfoUrl}?studentId=${studentId}`)
    .pipe(
     
      map((data) => {

      
      const resultMap = new Map<number, GroupChatInfo>(
        Object.entries(data).filter(([key]) => typeof key ==='string' && key.trim() !== '' && !isNaN(Number(key)))
      .map(([key, value]) => [Number(key), value as GroupChatInfo]));

      

       let chats = new Map<number, BehaviorSubject<ChatMessage[] | ChatMessage>>();

      let notifications = new Map<number, BehaviorSubject<_Notification[]>>();
    
     const userGroupChatIds = Array.from(resultMap.keys());

     userGroupChatIds.forEach((key) =>{
        chats.set(key, new BehaviorSubject<ChatMessage[] | ChatMessage>([]));

        notifications.set(key, new BehaviorSubject<_Notification[]>([]));

      });

      this.livePresenceMonitorService.populateGroupChatPresence(userGroupChatIds, this.currentUser()?.accessToken!, this.userId!);

      // sets a map that notifies subscribers(at the cache service) of new chat messages for the given studentId
      this.chatMessageSubjects.set(studentId, chats);

      // sets a map that notifies subscribers(at the cache service) of new chat notifications for the given studentId
      this.chatNotificationSubjects.set(studentId, notifications);

      // new chat connection signal per userId(where value is an array of group IDs)
      let m = new Map<number, number[]>();
      m.set(studentId, [...resultMap.keys()])

      // new notification connection signal per userId(where value is an array of group IDs)
      let n = new Map<number, number[]>();
      n.set(studentId, [...resultMap.keys()]);

      this.chatConnectionSignal.set(m);

      this.notificationConnectionSignal.set(n);
      // subsbcribe to the server to immediately begin to receive both instant and previous chat messages and notifications
      if(this.chatMessageSubjects.has(studentId) && this.chatNotificationSubjects.has(studentId)){

        this.connectToMessages();
      }

     
      return resultMap;

     
    }));

  }
  


  // fetch all the group chats from the server
  fetchGroupChats(): Observable<Map<number, GroupChatInfo>> {

    return this.http.get<Map<number, GroupChatInfo>>(this.endpoints.allGroupsUrl);
  }

  // send new chat messages to the server which then broadcasts the chats in realtime to all members online
  sendNewChatMessage(newChat: ChatMessage): Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.endpoints.newChatMessageUrl, newChat, 
      { 
        'observe': 'response',
        headers: {

          'Authorization':`Bearer ${this.currentUser()?.accessToken}`
        }

       })



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
  connectToMessages() {

      if(this.currentUser() && this.isStudent(this.currentUser())){

        this.disconnectFromSSE();

        this.connect(this.currentUser()!)

      }
  
  
    }

    private async connect(user:User){

      this.abortContoller = new AbortController();

      const token = user.accessToken;

      try {
        
        await fetchEventSource(`${this.messageUrl}?studentId=${user.id}`, {

          headers:{

            'Authorization': `Bearer ${token}`,
            'Accept':'text/event-stream',
            'Cache-Control':'no-ache',
            'Connection':'keep-alive'
          },
          signal: this.abortContoller.signal,

          openWhenHidden:true,

          onopen: async (response)  => {

            this.zone.run(() => {

            if ( response.ok || response.status === 200){

             
              this.retryCount = 0;

              return;
            }
            });

          },

          onmessage:(event:EventSourceMessage) => {

            this.zone.run(() => {

              try {
                
                if(event.event === 'chats'){


                 

                  const data:ChatMessage[] | ChatMessage = JSON.parse(event.data);

                   // emits previous chat messages to subscriber(cache service subscribes to receive such notification)
                 if(Array.isArray(data)){

                
                  const groupId = data[0].groupId;

                  this.chatMessageSubjects.get(user.id)?.get(groupId)?.next(data);
                 } else{

                  console.log(`received instant message: ${data}`)
                  this.chatMessageSubjects.get(user.id)?.get(data.groupId)?.next(data);
                 }

                }else if(event.event === 'notifications'){

                  const notifications:_Notification[] = JSON.parse(event.data);

                  // emits notification to subscribers(cache service subscribes to receive such notification)
                  this.chatNotificationSubjects.get(user.id)?.get(notifications[0].targetGroupChat!)?.next(notifications);

                }

              } catch (error) {
                console.error('error processing event', error)
              }

            });

          }, 
          onerror:(err) => {

            this.zone.run(() => {
              console.error('SSE error', err);

              if(err.name === 'AbortError') return;

              this.reconnectToServer();
            });
          },
          onclose:() => this.abortContoller?.abort()

        })

      } catch (error) {
        
      }


    }

    private isStudent(user?:User): boolean{

      return user ? user.roles.includes('Student') : false;


    }

  

  private reconnectToServer() {

   if(this.retryCount < this.maxRetries){

    const delay = Math.min(this.baseDelay * 2 ** this.retryCount, 30000); 
    
    this.retryCount++;
    setTimeout(() => {

      this.connectToMessages();
      
    }, delay);

   }else {

    this.disconnectFromSSE()
   }


  }

  // streams chat messages for the given group referenced by its ID, belonging to the given user(method is called from the cache service)
  public streamChatMessagesFor(studentId:number, groupId: number): Observable<ChatMessage[] | ChatMessage | undefined> {


    return defer(() => {

      const subject = this.chatMessageSubjects.get(studentId)?.get(groupId);

      return subject ? subject.asObservable() : of(undefined);
    })

  }

  
  // streams notification messages for the given group referenced by its ID, belonging to the given user(method is called from the cache service)
  public streamChatNotificationsFor(studentId :number,groupId: number): Observable<_Notification[] | undefined> {
    
    return defer(() => {

      const notification = this.chatNotificationSubjects.get(studentId)?.get(groupId);

      return notification ? notification.asObservable() : of(undefined);
    })


  }

 
  

 

 
  // stop further receiving of messages
  disconnectFromSSE() {

    this.abortContoller?.abort();
    this.abortContoller = null;

   
  }
  



  // deletes a given chat message whose groupId is the key and chatId is the value of the map
  deleteChatMessage(map: { [x: number]: number }, deleterId: number): Observable<HttpResponse<number>> {


    return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteChatUrl}?del_id=${deleterId}`, {
      body: map,
      observe: "response",
      headers: {
        'Authorization':`Bearer ${this.currentUser()?.accessToken}`
      }
    })

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


    return this.http.put<HttpStatusCode>(this.endpoints.editChatUrl, editableChat, { 
      observe: 'response',
      headers: {

        'Authorization': `Bearer ${this.currentUser()?.accessToken}`

      }
    
    });


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


