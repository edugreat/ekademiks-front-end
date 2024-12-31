
// service that caches chat messages in the indexedDB database
import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { ChatMessage } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatCacheService extends Dexie{

  chatCache: Dexie.Table<ChatEntry,string>; //Table definition

  constructor() {
    super('ChatDB'); //database name

    this.version(1).stores({
      chatCache:'groupId' //groupId is the primary key
    });

    this.chatCache = this.table('chatCache');
  }


  // save or update chat history

  async saveChat(groupId:string, messages:ChatMessage[]){

    await this.chatCache.put({groupId, messages});
  }
 

  // retrieve chat by groupId
  async getCachedChat(groupId:string):Promise<ChatMessage[]>{

  const entry =   await this.chatCache.get(groupId);

  return entry ? entry.messages : [];
  }

  // call this method to clear all cache upon logout
  async clearAllChats(){

    await this.chatCache.clear();
  }
}

interface ChatEntry{
  groupId:string;
  messages:ChatMessage[];
}
