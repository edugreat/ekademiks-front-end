import { Component, Input, OnDestroy, OnInit, input } from '@angular/core';
import { HomeService } from '../home.service';
import { Observable, Subscription } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.css',
    standalone: true,
    imports: [NgStyle]
})
export class WelcomeComponent implements OnInit, OnDestroy{

  //array of observable welcome messages received from the parent component
  @Input() welcomeMessages:Observable<string[]> | undefined;

  messages:string[] = []; //array of string welcome messages

  welcomeMsg = ''; //a single welcome message to be displayed on the interface

  welcomeMsgSub:Subscription | undefined;//welcome message subsciption

  timer: any;

  opacity:number = 1; //declares transistioning opacity 
  



  ngOnInit(): void {
    
    
    this.getWelcomeMessage();
   
  }

  ngOnDestroy(): void {
    
    clearInterval(this.timer);
    
    this.welcomeMsgSub?.unsubscribe;
  }

  getWelcomeMessage():void{

    
    this.welcomeMsgSub = this.welcomeMessages?.subscribe({
     next:((value:string[]) => {
      this.messages = value;
      this.welcomeMsg = this.messages[0];//assigns the initial value of welcome messages to the welcomemsg variable
      
    
    }),
     complete:(() => {
       let counter = 1;
      this.timer = setInterval(() =>{
        
      
      if(counter >= this.messages.length) counter = 0;//resets counter so welcome message would begin afresh
       
      this.welcomeMsg = '';//clears off the welcome

       //animates the opacity
    this.opacity = 0;//returns opacity to 0
    this.welcomeMsg = this.messages[counter++];//oupdates the welcome message
    let step = 0.1;//opacity incrementing factor
    let interval = setInterval(() =>{

      if(this.opacity < 1){
        this.opacity += step;
      }else{
        clearInterval(interval)
      }
    }, 1000)//a period of 1 second for the opacity transitioning effect

       
      }, 60000)
       
     })
    })
  }


}
