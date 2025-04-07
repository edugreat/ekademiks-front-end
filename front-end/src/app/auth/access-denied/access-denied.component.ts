import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-access-denied',
    templateUrl: './access-denied.component.html',
    styleUrl: './access-denied.component.css',
    standalone: true,
    imports: [MatProgressBar, MatIcon]
})
export class AccessDeniedComponent implements OnInit, OnDestroy{
  
  //error message to show to the user
  errorMessage?:string;

  //error progress bar value initially set 100
  barValue = 100;

  //timer that decreases progress bar value every second
  timer:any;
  constructor(private activatedRoute: ActivatedRoute, private router:Router){}
  
  ngOnInit(): void {
    this.displayErrorMessage();
    this.decreaseBarValue();
  }
  
ngOnDestroy(): void {
  clearInterval(this.timer);
}
  private displayErrorMessage(){

    //error status code received from the backend
    const errorCode = +this.activatedRoute.snapshot.params['code'];
   if(errorCode === 403){

      this.errorMessage = 'Access Denied!';
      this.unhide();
      setTimeout(() => {
        this.hide();
       
      }, 6000);

       // Take them to the home page
       this.router.navigate(['/home']);
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

private decreaseBarValue(){

  this.timer = setInterval(() =>{
    //decreases progress bar value by 20 every second
   this.barValue -=20;
  },1000)
}
}
