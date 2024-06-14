import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  

  form:FormGroup = this.formBuilder.group({

    email:['', [Validators.required, Validators.email]],
    password:['', [Validators.required]]
  });

  constructor(private authService: AuthService, 
    
  private formBuilder: FormBuilder,

  private router:Router){}


  //logs a user in
  public login(email:string,password:string):void{

    this.authService.login(email, password).subscribe({
      next:(user) => {
        this.authService.updateUserName(user.firstName);

        this.router.navigate(['/home']);
      //redirect to the assessment component
      },
      error:(err) => console.log(err)//EDIT THIS CODE LATER FOR PROPER ERROR HANDLING
    })
  }

  //if the current user is logged in
  public loggedIn():boolean{

    return this.authService.isLoggedIn();
  }

  //Log the current user out
  public logout():void{

    this.authService.logout();
  }

}
