import { Component } from '@angular/core';

// Component that provides policies on the creation and use of in-app group chats.
@Component({
    selector: 'app-chat-policy',
    templateUrl: './chat-policy.component.html',
    styleUrl: './chat-policy.component.css',
    standalone: true
})
export class ChatPolicyComponent  {


  // hides this component and allows them to continue once the user has agreed to the terms and contions
agree() {

  const el = document.getElementById('terms-overlay');
  if(el){

   
    el.classList.add('hide');
  }
}

// Returns the user to their previous page if the fail to agree to the term and conditions
decline() {

  window.history.back();
}




}
