import { inject, Injectable, NgZone, signal } from '@angular/core';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { BehaviorSubject, defer, Observable, of, ReplaySubject } from 'rxjs';
import { z } from 'zod';
import { LogoutDetectorService } from './logout-detector.service';

@Injectable({
  providedIn: 'root'
})

// This service is responsible for monitoring the live presence of users in group chats
export class LivePresenceMonitorService {

  private zone = inject(NgZone);
  private logoutDetectorService = inject(LogoutDetectorService);


  // keeps track of the number of online users in each group chat
 // private usersPerGroupPresenceCounts = signal<Map<number, number>>(new Map());

  private usersPerGroupPublisher: Map<number, BehaviorSubject<number>> = new Map();

  // property tracks and signals the count of group chats user are currently interacting with
  private groupChatPresence = new ReplaySubject<number[]>(1);
  
  private livePresenceUrl = 'http://localhost:8080/chats/live-presence';
 private abortController:AbortController | null = null;

 retryCount = 0;
 maxRetries = 25;
 baseDelay = 1000; // 1 second
  constructor() { }




  // method provide interface for subscribers to be notified on user presence publication
  public streamUserPresenceForGroup(groupChatId: number):Observable<number | undefined>{

    return defer(() => {
   
    const  publisher = this.usersPerGroupPublisher.get(groupChatId);

      return publisher ? publisher.asObservable() : of(undefined);
    })
  }

  // This method is used to populate the count of group chats users are logging into
  public populateGroupChatPresence(userGroupChatIds:number[], accessToken:string, studentId:number){

    //  add this ID to the list of group chats to query user live presence
    userGroupChatIds.forEach(groupId => {
      this.usersPerGroupPublisher.set(groupId, new BehaviorSubject<number>(0));
    })

    this.groupChatPresence.next(userGroupChatIds);

    this.queryPresence(userGroupChatIds, accessToken, studentId);

  
  }

  // since each SSE query must cleanse previous queries, there is need to submit all active group chat IDs for fresh queries
  private async queryPresence(userGroupChatIds:number[],accessToken:string, studentId:number){

   
   
    this.abortController?.abort();
    this.abortController = null;

    this.abortController = new AbortController();
    this.logoutDetectorService.addAbortController(this.abortController);
   try {
    
    await fetchEventSource(`${this.livePresenceUrl}`, {

      headers: {
        'user-group-chat-ids': userGroupChatIds.join(','),
        'studentId':`${studentId}`,
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

            const livePresence = this.entrySchema().safeParse(JSON.parse(event.data));
            
            if(livePresence.success){

              this.updateUserPerGroupPresenceCounts(livePresence.data.key, livePresence.data.value);

            

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

          this.reconnectToServer(userGroupChatIds, accessToken, studentId);
        })
      }
    })

   } catch (error) {
    
   }

  }



  private updateUserPerGroupPresenceCounts(groupId:number, currentCount:number){

   // notify subscribers of the change
   this.usersPerGroupPublisher.get(groupId)?.next(currentCount);

  }

  private reconnectToServer(userGroupChatIds:number[], accessToken:string, studentId:number){

    if(this.retryCount < this.maxRetries){
 
     const delay = Math.min(this.baseDelay * 2 ** this.retryCount, 30000); 
     
     this.retryCount++;
     setTimeout(() => {
 
       this.queryPresence(userGroupChatIds, accessToken, studentId);
       
     }, delay);
 
    }else {
 
     this.disconnectFromSSE()
    }
 
 
   }

   public getGroupChatPresence(){

    return this.groupChatPresence;
   }
 

  private disconnectFromSSE(){

    this.abortController?.abort();
    this.abortController = null;
  }

  
  private entrySchema(){

    return z.object({
      key:z.number(),
      value:z.number()
    })
  }

  
}
