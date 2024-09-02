import { Component, OnDestroy, OnInit, Type, ViewChild } from '@angular/core';
import { AuthService } from './auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCheckbox } from '@angular/material/checkbox';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnDestroy {

  

  form:FormGroup = this.formBuilder.group({

    email:['', [Validators.required, Validators.email]],
    password:['', [Validators.required]]
  });

  //Boolean flag that shows determines if password should be made visible or asterisked
  showPassword = false;


  
 dynamicPasswordInputType = 'password'; //property that toggles the password input field type between 'text' and 'password'


 signInErrorMessage? :string;

 opacity = 0; //display effect login success check mark

 timer:any; //opacity effect timer
 



  constructor(private authService: AuthService, 
    
  private formBuilder: FormBuilder,

  private router:Router){}

  @ViewChild(MatCheckbox) adminCheckbox!:MatCheckbox; //check box


  ngOnDestroy(): void {
    clearInterval(this.timer)
  }

  

  //logs a user in
  public login(email:string,password:string):void{

    // First, log the user out if already logged in
    if(this.isLoggedIn()){

      this.authService.logout();

    }

    //determine if the user wishes to login as an admin or student
    const role = this.adminCheckbox.checked ? 'admin' : 'student'

    this.authService.login(email, password, role).subscribe({
      next:(user) => {
        
        if(user){

          this.form.reset();
        this.opacityEffect();
          
        }

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2502);
        
      //redirect to the assessment component
      },
      error:(err:HttpErrorResponse) => {

        const element = document.getElementById('error');
        if(element){

          element.classList.remove('hidden');
         this.signInErrorMessage = err.error;
         this.form.get('password')?.reset('')
         if(this.showPassword){
          this.showPassword = !this.showPassword;
          //change the password visibility 
          this.dynamicPasswordInputType = 'password';
         }

         if(this.adminCheckbox.checked){
          this.adminCheckbox.toggle()
         
         }
        }
      }
    })
  }

  

  //Toggles password visibility
  toggleShowPassword(){

    this.showPassword = !this.showPassword;

    this.dynamicPasswordInputType = (this.showPassword) ? 'text' : 'password'; //dynamically change the input type depending on the 'showPassword' field variable
  }

  private opacityEffect(){

    const element = document.getElementById('success');

    if(element){
      element.classList.remove('hidden')
    }
   let step = 0.2;
   this.timer = setInterval(()=>{

    if(this.opacity < 1) this.opacity += step;
   },500)//increases opacity by 0.1 every second


  }

  //user may decide to hide the login error indicator
  hideError() {
    const element = document.getElementById('error');
    if(element){
     
      element.classList.add('hidden');
      
    }
    }
    
    // calls the authentication service isLoggeIn method 
    private isLoggedIn(){

      return this.authService.isLoggedIn();
    }
}
