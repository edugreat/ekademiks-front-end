import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit{
  
  //error message to show to the user
  errorMessage?:string;
  constructor(private activatedRoute: ActivatedRoute){}
  
  ngOnInit(): void {
    this.displayErrorMessage();
  }
  

  private displayErrorMessage(){

    //error status code received from the backend
    const errorCode = +this.activatedRoute.snapshot.params['code'];
   
    if(errorCode === 401){
      this.errorMessage = 'Unauthorized Request!';
      this.unhide();
      setTimeout(() => {
        this.hide();
        window.history.back();
      }, 5000);
    }else if(errorCode === 403){

      this.errorMessage = 'Access Denied!';
      this.unhide();
      setTimeout(() => {
        this.hide();
        window.history.back();
      }, 5000);
    }

    
  }

  //upon error, unhide the component
private unhide(){

  const element  = document.getElementById('error');
  if(element){
    element.classList.remove('hide')
  }
}

//hides the component after duration determined by the setTimeout
private hide(){

  const element = document.getElementById('error');
  if(element){
    element.classList.add('hide')
  }
}
}
