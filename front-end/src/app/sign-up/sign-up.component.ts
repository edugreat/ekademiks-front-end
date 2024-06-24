import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { emailValidator, nameValidator, passwordValidator, phoneNumberValidator } from './valid.credentials';
import { NewUser, SignUpService } from './sign-up.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {

  constructor(private signupService:SignUpService){}


  

  //Boolean flag to show if the password field and the password confirmation fields mismatch
 passwordMismatch: boolean = false;

 showPassword = false //boolean flag that determines if password should be made visible or asterisked

 dynamicPasswordInputType = 'password'; //property that toggles the password input field type between 'text' and 'password'

 dynamicConfirmPasswordInputType = 'password';//property that toggles the password confirmation field between 'text' and 'password'

 showConfirmationPassword = false; //boolean flag that determines if the confirmation password should be visible or asteriked

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
 // console.log(`${newUser._email} ${newUser._firstName} ${newUser._password} ${newUser._mobileNumber} ${newUser._lastName}`)

  this.signupService.registerUser(newUser).subscribe(status =>{

    console.log(status);

  })
  //console.log(JSON.stringify(this.newUser))

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
}
