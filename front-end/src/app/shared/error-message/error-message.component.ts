import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent implements OnInit {

  
  errorMessage: string|null = null;
  DEFAULT_ERROR_MSG = "We're sorry, but an unexpected error has occurred. Please try again later.";
  

  constructor(private activatedRouter:ActivatedRoute){

  }
  
  ngOnInit(): void {

    this.activatedRouter.paramMap.subscribe(params => this.errorMessage = params.get('message'))
    
  }


  goBack() {
    
    window.history.back();
    
  }
  
}