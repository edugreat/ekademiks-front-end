import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ChatService, GroupChatInfo } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, take, tap } from 'rxjs';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css'
})
// components that displays all the group chats the student belongs to
export class MyGroupsComponent implements OnInit, OnDestroy{



  // an object representing the user's group chat. The key is the group the user belong to and the value is the previous chats
  groupChatInfo?:GroupChatInfo;

  groupChatInfoSub?:Subscription;

  private sub?:Subscription;


  constructor(private chatService:ChatService, private activatedRoute:ActivatedRoute, private router:Router){}
  
  
  ngOnInit(): void {
    
    this.activatedRoute.paramMap.subscribe(param => {

    

    //  retrieve the student id
    const studentId = param.get('studentId');

    if(studentId){

      this.getUnreadChats(Number(studentId));
    }
    })
    
     // prevents browser refresh while in this component

  }


  ngOnDestroy(): void {
    
    this.sub?.unsubscribe();
   
  }

 

  private getUnreadChats(studentId:number){

    this.groupChatInfoSub = this.chatService.unreadChats(studentId).subscribe({
      next:(info:GroupChatInfo) => this.groupChatInfo = info,

      error:(err) => console.log(err)
    });

  }

  connectToChat(groupId:string, groupDescription:string, groupAdminId:string){

   

    
    this.router.navigate([groupId, groupAdminId, groupDescription],{relativeTo: this.activatedRoute})
  }
}


