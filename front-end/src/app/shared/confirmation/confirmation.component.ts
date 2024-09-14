import { Component, OnInit } from '@angular/core';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})

//component that provides confirmation dialog for users to confirm their initiated actions
export class ConfirmationComponent implements OnInit {


  //dialog message to present to the user to consent to or decline an impending action
  message? : string;

  constructor(private confirmService:ConfirmationDialogService){}

  ngOnInit(): void {
    this.confirmationMessage();
  }

//method that subscribes to the confirmation service to recieve the confirmation message and then opens the dialog if confirmation message is not empty
  private confirmationMessage() {
    this.confirmService.actionMessageConfirm$.subscribe((message) => {
      this.message = message;

      if (message) {
          this.openDialog();
      }

    });
  }

 

  //method that receives user confirmation response, then calls the confirmation service to emit the response
  confirm(response: boolean) {
      this.confirmService.confirmationResponse(response)//emits true or true
    //  Closes the confrmation dialog once the user has responsed
      this.closeDialog(); 
     
     
    }
    
    

    //opens the confirmation dialog by removing 'hidden' from the class list
   private  openDialog(){
    const dialog = document.getElementById('custom-confirmation');
    if(dialog){

      dialog.classList.remove('hidden')

    }      
    }

    //hides confirmation dialog by adding 'hidden' to class list 
    private closeDialog(){

      const dialog = document.getElementById('custom-confirmation');
    if(dialog){

      dialog.classList.add('hidden')

    }      
    }

   
}
