import { Component, OnInit } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emailValidator, nameValidator, passwordValidator } from './valid.credentials';
import { NewUser, SignUpService } from './sign-up.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProgressBarMode } from '@angular/material/progress-bar';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  //encapsulation: ViewEncapsulation.None // Disable view encapsulation
})
export class SignUpComponent implements OnInit {

  constructor(private signupService:SignUpService,
    private successSnackBar:MatSnackBar,
    private router: Router){}


  

  //Boolean flag to show if the password field and the password confirmation fields mismatch
 passwordMismatch: boolean = false;

 showPassword = false //boolean flag that determines if password should be made visible or asterisked

 dynamicPasswordInputType = 'password'; //property that toggles the password input field type between 'text' and 'password'

 dynamicConfirmPasswordInputType = 'password';//property that toggles the password confirmation field between 'text' and 'password'

 showConfirmationPassword = false; //boolean flag that determines if the confirmation password should be visible or asteriked


 accountCreated = false; //shows if the new account creation is successul or not

 
 networkBusy = false;//shows if the network is busy or, for the purpose of spinner

 //deviceSm = false; //true if users device is small screen

 progressBarMode:ProgressBarMode = 'buffer';

 //Object representing the new user form group
  userForm = new FormGroup({

    firstName: new FormControl('', {
      nonNullable:true,
      validators:[Validators.required, nameValidator()]
    }),
    lastName: new FormControl('', {
      nonNullable:true,
      validators:[Validators.required, nameValidator()]
    }),
    email:new FormControl('',{nonNullable:true,
      validators:[emailValidator()]
    }),
    password:new FormControl('', {nonNullable:true,
      validators:[Validators.required, passwordValidator()]
    }),
    confirmPassword: new FormControl('',{nonNullable:true,
      validators:[Validators.required, passwordValidator()]
    }),
    mobileNumber: new FormControl<string | undefined>(undefined, {nonNullable:true},
      
    )
  })
  

  ngOnInit(): void {

    this.userForm.get('password')?.valueChanges.subscribe(() =>{

      this.chechPasswordMatch();
    });

    this.userForm.get('confirmPassword')?.valueChanges.subscribe(() =>{

      this.chechPasswordMatch()
    });

    
    
  }


  //Method that creates the new user's account
  createAccount(){

  const newUser = new NewUser(
    this.userForm.get('firstName')!.value,
    this.userForm.get('lastName')!.value,
    this.userForm.get('email')!.value,
    this.userForm.get('password')!.value,
    this.userForm.get('mobileNumber')?.value,
  );

  this.networkBusy =true;
  this.signupService.registerUser(newUser).subscribe(({
    next:(status) => {
      console.log(status);
      this.networkBusy = false;

    },

    error:(error) => {
      this.networkBusy =false;
      console.log(error)
    },

    complete:() => {
      this.userForm.reset();
      this.networkBusy = true;//take a while to let user know their account creation was successful by setting timeout
      this.openSnackBar();//shows the account creation success message

      setTimeout(() =>{

        this.router.navigate(['/login']) //redirects the user to the login page once the snack bar closes
      },5000)//5 seconds delay to let users know account creation was successful before routing to the login page

    }
  }))
  

  }

  //Private method that checks if the password mismatches with the password confirmation, thereby updating the 'passwordMismatch' property
  private chechPasswordMatch(){

    const password = this.userForm.get('password')?.value;
    const confirmation = this.userForm.get('confirmPassword')?.value;

    this.passwordMismatch = password !== confirmation;
  }

  //Toggles the visibility of the password
  toggleShowPassword(){

    this.showPassword = !this.showPassword;
    this.dynamicPasswordInputType = (this.showPassword === true) ? 'text' : 'password';
  }

  //Toggles the visibility of the password confirmation
  toggleShowConfirmPassword(){
 this.showConfirmationPassword = !this.showConfirmationPassword;
 this.dynamicConfirmPasswordInputType = (this.showConfirmationPassword === true) ? 'text' : 'password';

  }

  //opens the snack bar to notify user of successful account creation
  private openSnackBar(){
   this.successSnackBar.open(
    'Account Created!', '', {
      duration: 5000, // 5 seconds
      verticalPosition: 'top', 
      horizontalPosition: 'center', 
      panelClass: ['success-snackbar']
    }
   )

  }

  
}
