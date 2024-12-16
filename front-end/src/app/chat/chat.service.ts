import { enableProdMode, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Endpoints } from '../end-point';
import { BehaviorSubject, Observable, Subject, Subscription, tap } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { _Notification as _Notification } from '../admin/upload/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class  ChatService implements OnDestroy {
 
  
  
  private chatEventSource?: EventSource;

  private reconnectionTiming:any;
  private loginSub?:Subscription;

  // keeps try of the number of reconnection counts when server sent event connection is lost
  private retryCount = 0;

  


  // message chat observable that emits chats
  private chatSubject = new Subject<ChatMessage>();

  chatMessages$ = this.chatSubject.asObservable();


  // observable that emits notifications such as request to join a group chat
  private joinGroupRequest = new Subject<_Notification>();
 
  joinGroupRequest$ = this.joinGroupRequest.asObservable();


  constructor(private endpoints:Endpoints,
     private http:HttpClient, private zone:NgZone, private authService:AuthService) { 

      // disconnect from receiving chat messages once the user logs out
     this.loginSub = this.authService.studentLoginObs$.subscribe(isLoggedIn => {

        if(!isLoggedIn) this.disconnectFromSSE();
      });

    
     }

     ngOnDestroy(): void {
       this.loginSub?.unsubscribe();
     }

  createGroupChat(dto:any):Observable<HttpResponse<number>>{

    return this.http.post<HttpStatusCode>(this.endpoints.createGroupChatUrl, dto,{observe:'response'});
  }

  // returns all the id for the groups the student already belongs to
  myGroupIds(studentId:number):Observable<number[]>{

    return this.http.get<number[]>(`${this.endpoints.myGroupIdsUrl}?studentId=${studentId}`)

  }
  // communicates to the server endpoint to fetch to fetch unread chats count for the given student
  // Unread chats count is a map object having the group's id as the key, and count of unread messages(greater than or zero) as the values
  groupInfo(studentId:number):Observable<any>{

    return this.http.get<any>(`${this.endpoints.groupInfoUrl}?studentId=${studentId}`);

  }

  // get group chat messages
  groupChatUpdates(groupId:number, studentId:number){

    

    this.connectToChatMessages(groupId, studentId);
  }

  // fetch all the group chats from the server
  fetchGroupChats():Observable<GroupChatInfo>{

    return this.http.get<GroupChatInfo>(this.endpoints.allGroupsUrl);
  }

  // send new chat messages to the server which then broadcasts the chats in realtime to all members online
  sendNewChatMessage(newChat:ChatMessage):Observable<HttpResponse<number>>{

  
    

    return this.http.post<HttpStatusCode>(this.endpoints.newChatMessageUrl, newChat,{'observe':'response'})



  }

  sendJoinRequest(joinGroupRequest:GroupJoinRequest):Observable<HttpResponse<number>>{

    return this.http.post<HttpStatusCode>(this.endpoints.joinRequestUrl, joinGroupRequest, {'observe':'response'})

  }

  // calls the server side to approvide user's requst to join the group chat referenced by groupId.
  // requesterId is the ID to points to the user that actually requested to join the groupchat
  approveJoinRequest(groupId: number, requesterId: number, requestId:number):Observable<HttpResponse<number>> {

   

    return this.http.post<HttpStatusCode>(`${this.endpoints.approveRequestUrl}?id=${requestId}`, {[groupId]:requesterId}, {'observe':'response'})

    

  }

  // calls the server to decline user's request to join the group chat
  declineJoinRequest(groupId: number, studentId: number, notificationId:number):Observable<HttpResponse<number>> {

    return this.http.get<HttpStatusCode>(`${this.endpoints.declineJoinRequestUrl}?grp=${groupId}&stu=${studentId}&notice_id=${notificationId}`,{'observe':'response'});
  

  }



  // method that deletes the given join request notification referenced by the notification ID
  deleteChatNotifications(studentId: number,notificationIds: number[]):Observable<void> {

    return this.http.delete<void>(`${this.endpoints.deleteChatNotificationsUrl}?owner_id=${studentId}`, {
      headers:new HttpHeaders({'content-type':'application/json'}),
      body:notificationIds
    })
   
   

  }

  // fetches all the group chats the user has once requested to join, which have yet to receive approval or disapproval
  getPendingGroupChatRequestsFor(studentId: number):Observable<number[]> {

    return this.http.get<number[]>(`${this.endpoints.pendingGroupChatRequestsUrl}?studentId=${studentId}`)



  }


  hadPreviousPosts(studentId: number, groupId:number):Observable<boolean> {

    const data:{[studentId:number]:number} = {[studentId]:groupId}
   
    return this.http.post<boolean>(`${this.endpoints.anyRecentPosts}`,data)
   
  }

  // method that establishes a unidirectional messaging system where the server forwards previous chat messages to the client via the server sent event emitter client
  private connectToChatMessages(groupId: number, studentId:number){

    // // closes the previous event source before connecting to avoid receiving stale chats
     if(this.chatEventSource) this.chatEventSource.close();

     

    this.chatEventSource = new EventSource(`${this.endpoints.chatMessagesUrl}?group=${groupId}&student=${studentId}`);

    // add event listener to only listen to chat events
   this.chatEventSource.addEventListener('chats', (event:MessageEvent<any>) => {

      this.zone.run(() => {

        // check if any message has been received
        if(event){

          console.log('connected to chats')

          const _notification:any = JSON.parse(event.data);

          // confirm the type of notification received
          if(this.isJoinGroupRequest(_notification)){

            const notification:_Notification = _notification;
          

            // emits to active subscribers
            this.joinGroupRequest.next(notification);
          }else if(this.isChatMessages(_notification)){


            const chatMessage: ChatMessage = _notification;

        // emits to active subscribers
            this.chatSubject.next(chatMessage);
          }
          
          
         

        }
      })
    });

    // executes once an error occurs
    this.chatEventSource.onerror = () => {

      console.log('retrying connections to chats');
      // error handling retry connection that ensures retry time does not exceed 30 seconds
      const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

      this.retryCount++;
      // close and reconnect the event source
      this.reconnectionTiming = setTimeout(() => {
        
        this.connectToChatMessages(groupId,studentId);
      }, retryDelay);

    };

    this.chatEventSource!.onopen = () => {

     

      this.retryCount = 0;
     }

  }
  

  // deletes a given chat message whose groupId is the key and chatId is the value of the map
  deleteChatMessage(map: { [x: number]: number }):Observable<HttpResponse<number>> {
  

    return this.http.delete<HttpStatusCode>(this.endpoints.deleteChatUrl, {
      body:map,
      observe:"response"
    })

  }


  // disconnect from the chat SSE service
  disconnectFromSSE() {
    
    if(this.chatEventSource) {
      this.chatEventSource.close();

     

      clearTimeout(this.reconnectionTiming);
    }
  }

  // checks if the new notification received is a request to join group chat or about new member that has just joined the group chat
  private isJoinGroupRequest(data:any):data is _Notification{

    return (data as _Notification).notifier !== undefined &&
  ( (data as _Notification).type === 'join group' || (data as _Notification).type === 'new member' );
  }

  // check if the notification received is chat message
  private isChatMessages(data: any): data is ChatMessage {
   
    return (data as ChatMessage).onlineMembers !== undefined;
  }


  // implements functionality for editing group chat names
  editGroupName(_studentId: string, groupId: string, currentGroupName: string):Observable<HttpResponse<number>> {

    
    return this.http.patch<HttpStatusCode>(`${this.endpoints.editGroupUrl}?_new=${currentGroupName}`, {[Number(_studentId)]:Number(groupId)}  ,{'observe':'response'})
  }


  // _studentId is used to verify that it's the group admin who actually wants to delete the group chat
  deleteGroupChat(_studentId: string, groupId: string):Observable<HttpResponse<number>> {
   
    

    return this.http.delete<HttpStatusCode>(this.endpoints.deleteGroupUrl, {
      headers:new HttpHeaders({'content-type':'application/json'}),
      observe:'response',
      body:{[Number(_studentId)]: Number(groupId)}
    })

  }

  leaveGroup(groupId: number, studentId: number):Observable<HttpResponse<number>> {

    return this.http.delete<HttpStatusCode>(this.endpoints.leaveGroupUrl, {

      headers: new HttpHeaders({'content-type':'application/json'}),
      observe:'response',
      body:{[groupId]:studentId}
    })
    
  }

  updateChat(editableChat: ChatMessage) :Observable<HttpResponse<number>> {
    

   

    return this.http.put<HttpStatusCode>(this.endpoints.editChatUrl, editableChat, {observe:'response'});

   
  }
}


// a type representing the chat messages for the a given group chat
export type ChatMessage = {

  id?:number,
  groupId:number,
  senderId:number,
  senderName?:string,
  content:string,
  repliedTo?:number,//ID of the chat that was replied to assuming this was a replied chat
  repliedToChat?:string,//The actual chat message that was replied to if this was a replied chat
  sentAt:Date,
  onlineMembers?:number//tracks the number of members who are currently online


}

// a key-value pair object representing group chats where the key is the group chat id.
export type GroupChatInfo = {

 [groupId:number]:{
   unreadChats:number, // zero or more unread chats
   groupName:string, // the group chat name
   createdAt:Date, // the date the group was created
   groupIconUrl:string, // the group icon url pointing to the group icon
   groupDescription:string, // the group description which every group chat must have. It portrays their ideology 
   groupAdminId:string, // information pointing the group admin
   hasPreviousPosts:boolean //determines if the group chat previous posts
  }
}

// object for sending request to join group chats
export type GroupJoinRequest = {

  groupId:string,
  requesterId:string  | null,
  groupAdminId:string,
  requestedAt:Date,
  requester:string //the name of the user requesting to join the group chat
}


