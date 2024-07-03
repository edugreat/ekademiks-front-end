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

  //Boolean flag that shows determines if password should be made visible or asterisked
  showPassword = false;

  
 dynamicPasswordInputType = 'password'; //property that toggles the password input field type between 'text' and 'password'



  constructor(private authService: AuthService, 
    
  private formBuilder: FormBuilder,

  private router:Router){}


  //logs a user in
  public login(email:string,password:string):void{

    this.authService.login(email, password).subscribe({
      next:(user) => {
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

  // //Log the current user out
  // public logout():void{

  //   this.authService.logout();
  // }


  //Toggles password visibility
  toggleShowPassword(){

    this.showPassword = !this.showPassword;

    this.dynamicPasswordInputType = (this.showPassword) ? 'text' : 'password'; //dynamically change the input type depending on the 'showPassword' field variable
  }

}
