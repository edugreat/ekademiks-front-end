import { group } from '@angular/animations';
import { inject, Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { z } from 'zod';

@Injectable({
  providedIn: 'root'
})

// This service is responsible for monitoring the live presence of users in group chats
export class LivePresenceMonitorService {

  private zone = inject(NgZone);

  // keeps a unique track of group chat IDs logged in users are currently present in
  private groupChatPresence = signal<number[]>([]);

  // keeps track of the number of online users in each group chat
  private userPresenceCounts = signal<Map<number, number>>(new Map());

  private userPresencePublisher: Map<number, BehaviorSubject<number>> = new Map();
  
  private livePresenceUrl = 'http://localhost:8080/live-presence';
 private abortController:AbortController | null = null;

 retryCount = 0;
 maxRetries = 25;
 baseDelay = 1000; // 1 second
  constructor() { }




  private updateUserPresenceCounts(groupId:number, currentCount:number){
  
    if(this.userPresenceCounts().has(groupId)){
     this.userPresenceCounts().set(groupId, currentCount);
     // notify subscribers of the change
    this.userPresencePublisher.get(groupId)?.next(currentCount);

    }

  }

  // method provide interface for subscribers to be notified on user presence publication
  public streamUserPresenceForGroup(groupChatId: number):Observable<number | undefined>{

    return this.userPresencePublisher.get(groupChatId) 
    ? this.userPresencePublisher.get(groupChatId)!.asObservable() : of(undefined);
    
  }

  // this method ensures one-time query for user presence per group chat to which users log in
  public queryUserPresence(groupChatId:number, accessToken:string){
 
    if(!this.groupChatPresence().includes(groupChatId)){
  //  add this ID to the list of group chats to query user live presence
  this.groupChatPresence.update((prev) => [...prev, groupChatId]);

  // the automatically queryPresenceForAll()
  this.queryPresenceForAll(accessToken);

    }

  }

  // since each SSE query must cleanse previous queries, there is need to submit all active group chat IDs for fresh queries
  private async queryPresenceForAll(accessToken:string){

    this.abortController = new AbortController();
   try {
    
    await fetchEventSource(`${this.livePresenceUrl}`, {

      headers: {
         'group-chat-ids': JSON.stringify(this.groupChatPresence()),
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'connection': 'keep-alive',
      },
      signal:this.abortController.signal,
      openWhenHidden:true,
      
      onopen:async(reponse) => {
      this.zone.run(() => {
        
      if(reponse.ok){
        this.retryCount = 0;
        return;
      } 
      })
        
      },

      onmessage:(event:EventSourceMessage) => {

        this.zone.run(() => {

          if(event.event === 'live-presence'){

            const livePresence = this.entrySchema().safeParse(JSON);
            if(livePresence.success){

              this.updateUserPresenceCounts(livePresence.data.key, livePresence.data.value);

            }else{
              console.error('Invalid live presence data:', livePresence.error);
            }
          }

        })
      },
      onerror:(error) => {

        this.zone.run(() => {
          console.log('Error in SSE:', error);

          if(error.name === 'AbortError'){
            return;
          }

          this.reconnectToServer(accessToken);
        })
      }
    })

   } catch (error) {
    
   }

  }

  private reconnectToServer(accessToken:string){

    if(this.retryCount < this.maxRetries){
 
     const delay = Math.min(this.baseDelay * 2 ** this.retryCount, 30000); 
     
     this.retryCount++;
     setTimeout(() => {
 
       this.queryPresenceForAll(accessToken);
       
     }, delay);
 
    }else {
 
     this.disconnectFromSSE()
    }
 
 
   }
 

  private disconnectFromSSE(){

    this.abortController?.abort();
    this.abortController = null;
  }

  // returns number of group chats currently being monitored for live presence
  public get groupChatPresenceCounts():number[]{

    return this.groupChatPresence();

  }
  private entrySchema(){

    return z.object({
      key:z.number(),
      value:z.number()
    })
  }

  
}
