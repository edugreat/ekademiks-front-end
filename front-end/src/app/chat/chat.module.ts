import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewGroupChatComponent } from './new-group-chat/new-group-chat.component';
import { SharedModule } from '../shared/shared.module';
import { ChatPolicyComponent } from './chat-policy/chat-policy.component';
import { RouterModule } from '@angular/router';
import { MyGroupsComponent } from './my-groups/my-groups.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { GroupRequestComponent } from './group-request/group-request.component';
import { NotificationsDetailComponent } from './group-chat/request-notifications-detail/notifications-detail.component';



@NgModule({
  declarations: [
    NewGroupChatComponent,
    ChatPolicyComponent,
    MyGroupsComponent,
    GroupChatComponent,
    GroupRequestComponent,
    NotificationsDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ]
})
export class ChatModule { }
