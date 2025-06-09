
// service that caches chat messages in the indexedDB database
import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import Dexie from 'dexie';
import { ChatMessage, ChatService } from './chat.service';
import { _Notification } from '../admin/upload/notifications/notifications.service';
import { User } from '../auth/auth.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { LogoutDetectorService } from '../logout-detector.service';

@Injectable({
  providedIn: 'root'
})
export class ChatCacheService extends Dexie{

  chatCache: Dexie.Table<ChatEntry,string>; //IndexDB Table definition where chats are cached for easy retrieval without incessant server queries

  // indexed table that caches notification for easy retrieval
  notificationCache: Dexie.Table<NotificationEntry, string>;
  
  private chatService = inject(ChatService);

  public activeUsersCountByGroup:Map<number, WritableSignal<number | undefined>> = new Map();

  private chatConnectionSignal = computed(() => this.chatService.chatConnectionSignal().size > 0 ? this.chatService.chatConnectionSignal() : new Map<number, number[]>());
  

  // for each user (key), store subscription that listens to messages for each of the group they belong to
 private chatMessageSubscriptions = new Map<number, Subscription[]>();
  

  // for each user (key), store subscription that listens to chat related notifications for each of the group they belong to
 private chatNotificationSubscription = new Map<number, Subscription[]>();
 


 /** 
  * This signal property retrieves user's cached messages into an array, then emits to subscriber
  * at the group-chat-component.ts each time the request for it.
  * Also when instant messages come, it automatically emit to currently listening subscribers
 */
   chatMessages = signal<ChatMessage[] | ChatMessage>([]);



 /** 
  * This signal property retrieves user's cached chat notifications into an array, then emits to subscriber
  * at the group-chat-component.ts each time they request for it.
  * Also when instant notifications come, it automatically emit to currently listening subscribers
 */
chatNotifications = signal<_Notification[]>([]);

   logoutDetectorService = inject(LogoutDetectorService);

  // this writable signal keeps track of the current groupId the user wants to access their stored chat messages, and also gets notified of instant messages for the group.
  currentGroupId:WritableSignal<number | undefined> = signal(undefined);

 
 
   
  // Arbitrary content for deleted chats
  private DELETEDCHATCONTENT = '$2a$10$IFch8ji5EgMhuOQdBjdIE.tzyvQbtCEdHSsujbSUALasTHPA87GwO';

  constructor() {
    super('ChatDB'); //database name

    this.version(1).stores({
      chatCache:'groupId', //groupId is the primary key
      notificationCache:'groupId'
    });

    this.chatCache = this.table('chatCache');
    this.notificationCache = this.table('notificationCache');

    
    this.subscribeToChatMessages();

      
    this.subscribeToChatNotifications();

    effect(() => {

      if(this.currentGroupId()) {
        this.streamChatsForGroup(this.currentGroupId()!);
      }
    },{allowSignalWrites:true})

   

  }



  private subscribeToChatNotifications() {

    // unsubscribe previous subscriptions
    this.chatNotificationSubscription.forEach(subs => subs.forEach(sub => sub.unsubscribe()));

    const notificationConnectionSignal = this.chatService.notificationConnectionSignal();
    Array.from(notificationConnectionSignal.keys())
      .forEach(userId => {

      //  create subscription array for the user
     const subs:Subscription[] = [];


        const userGroups = notificationConnectionSignal.get(userId);

        userGroups?.forEach(groupId => {

          // create subscription for that listens to notifications on this group
        const  sub = this.chatService.streamChatNotificationsFor(userId, groupId)
                                .subscribe(notifications => notifications?.forEach(notification => this.addToNotifications(notification)))

                  
        subs.push(sub);

        });

        if (subs.length) {
          this.chatNotificationSubscription.set(userId, subs);
        }
      });
  }

  private subscribeToChatMessages() {

    // unsubscribe previous subscriptions
   this.chatMessageSubscriptions.forEach(subs => subs.forEach(sub => sub.unsubscribe()));

   this.chatMessageSubscriptions.clear();

   
    Array.from(this.chatConnectionSignal().keys())
      .forEach(userId => {

        // create subscription array for the given user
        let subs:Subscription[] = [];

        const userGroups = this.chatConnectionSignal().get(userId);
        userGroups?.forEach(groupId => {

          // create a subscription that listens to chat messages on this group chat, adding up the messages as they arrive
          const sub = this.chatService.streamChatMessagesFor(userId, groupId)
          .subscribe(messageData => {

           if(Array.isArray(messageData)){
          this.addPreviousChatMessages(messageData);

           }else if(messageData){

            this.addToChatMessages(messageData);
           }
          });

        //  add to the array of subscriptions
        subs.push(sub);

        });

        if (subs.length) {

          // set up a group of chat message listeners for the given user.
         this.chatMessageSubscriptions.set(userId, subs);
        }
      });
  }

 
  // save or update chat history
  async persistChatsToDB(groupId:string, messages:ChatMessage[]){

    await this.chatCache.put({groupId, messages});

    
    
  }

  async persistNotificationToDB(groupId:string, notifications:_Notification[]){

    await this.notificationCache.put({groupId, notifications});
  }
 

  // retrieve chat by groupId
  async getCachedChats(groupId:string):Promise<ChatMessage[]>{

  const entry =   await this.chatCache.get(groupId);

  return entry ? entry.messages : [];
  }

  async getCachedNotification(groupId:string):Promise<_Notification[]>{

    const entry =  await this.notificationCache.get(groupId);

    return entry ? entry.notifications : [];
  }

  // call this method to clear all cache upon logout
  async clearAllChats(){

    await this.chatCache.clear();
    await this.notificationCache.clear();
  }


 
  


  private async addToChatMessages(incomingChat: ChatMessage) {

    
  
      let savedChats = await this.getCachedChats(`${incomingChat.groupId}`);
  
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
  
          //  check if the incoming chat is an edited version of a previous chat
          if (index !== -1 && incomingChat.content !== savedChats[index].content) {
  
            savedChats[index].content = incomingChat.content;
            savedChats[index].editedChat = true;
          } else if (index === -1) {
  
            // this is the case of a new chat message
            savedChats.push(incomingChat);

            // send instantly to listener if actively listening
            if(this.currentGroupId() && incomingChat.groupId === this.currentGroupId()){
             
                this.streamChatsForGroup(incomingChat.groupId, incomingChat);
                       
            }
          }
  
  
          break;
      }
  
  
      // perform final update to keep the database in sync
      this.persistChatsToDB(`${incomingChat.groupId}`, savedChats);

    }

    // method that gets called once previous chat messages get retrieved for the first time.
    // This method should be called once per user per group chat
    private async addPreviousChatMessages(previousChats:ChatMessage[]){

      const groupId = previousChats[0].groupId;
      // make first persist to the database
      this.persistChatsToDB(`${groupId}`, previousChats);

      if(this.currentGroupId() && groupId === this.currentGroupId()){

        this.streamChatsForGroup(groupId);

      }

     

    }

   
    // method that fetches from indexedDB, chat messages for a given group chat ID.
  //  If instant chat is given, then only stream the instant chat message, else stream the previous chat messages
    private async streamChatsForGroup(groupId:number, instantChat?:ChatMessage){

      if(instantChat){

        console.log(`receiving instant chat from the cached-service: ${JSON.stringify(instantChat)}`)

        this.chatMessages.set(instantChat);

        return;
      }

      this.getCachedChats(`${groupId}`).then(messages => this.chatMessages.set(messages));
      
    }

    // method that fetche from the indexedDB, chat notifications for a given chat ID
    private streamChatNotificationsForGroup(groupId:number){


      this.getCachedNotification(`${groupId}`).then(n => this.chatNotifications.set(n));
    }

   
    private async addToNotifications(notification:_Notification){

      // get already existing notifications
      const existingNotifications = await this.getCachedNotification(`${notification.id}`);

      if(!existingNotifications.length){

        existingNotifications.push(notification);

        this.persistNotificationToDB(`${notification.id}`, existingNotifications);
      }else{

        // ensure no duplicate notification
     const index =    existingNotifications.findIndex(n => n.id === notification.id);

     if(!index){

      existingNotifications.push(notification);

      this.persistNotificationToDB(`${notification.id}`, existingNotifications);
     }
      }

      // ensuring the notification gets to the intended group ID
      if(this.currentGroupId()){

        this.streamChatNotificationsForGroup(this.currentGroupId()!)
      }


    }

    /*
    method that updates the cached chat messages after deletion of a given chat
    The update is done on the client side once 200 status ok is received from the server for the operation.
    This is just to excessive server calls for operation like this
    */

    async updateChatsAfterDeletetion(groupId:number, deletedChatId:number, deleter:User){

      // get the chats from which this was deleted
      let groupChats = await this.getCachedChats(`${groupId}`);

      // get the deleted chat index
      let index = groupChats.findIndex(c => c.id === deletedChatId);

      if(index !== -1){

     let staleChat =   groupChats.splice(index, 1);
    
     if(staleChat.length){


      // get chats that may have replied to the deleted chats
      const chatRepliers = this.repliers(deletedChatId, groupChats);

      // update chat repliers with info about the users that deleted the chat
      chatRepliers.forEach(replier => {

        replier.deleterId = deleter.id;

        replier.deleter = deleter.firstName;

        // replace replier with its updated version
        groupChats.splice(groupChats.findIndex(c => c.id === replier.id), 1, replier);
      });
      
      this.persistChatsToDB(`${groupId}`, groupChats);

      this.streamChatsForGroup(groupId);
     }
    }
    }
  
    // return an array of chat replies for the chat referenced by id
    repliers(id: number, savedChats: ChatMessage[]): ChatMessage[] {
  
  
      return savedChats.filter(c => c.repliedTo === id);
    }

   
}

interface ChatEntry{
  groupId:string;
  messages:ChatMessage[];
}

interface NotificationEntry{
  groupId:string;
  notifications:_Notification[];
}