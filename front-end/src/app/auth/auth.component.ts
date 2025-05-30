import { afterNextRender, afterRender, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from './auth.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton, MatButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSuffix, MatFormField, MatHint, MatError } from '@angular/material/form-field';
import { NgStyle, NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';


@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.css',
    standalone: true,
    imports: [MatIconButton, MatIcon, MatSuffix, NgStyle, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatHint, NgIf, MatError, MatButton, MatCheckbox, MatAnchor, RouterLink, MatDivider]
})
export class AuthComponent implements OnDestroy {

  

  form:FormGroup = this.formBuilder.group({

    email:['', [Validators.required, Validators.email]],
    password:['', [Validators.required]]
  });

  //Boolean flag that shows determines if password should be made visible or asterisked
  showPassword = false;


  @ViewChild('emailInput')emailInput!:ElementRef<HTMLInputElement>;
  
 dynamicPasswordInputType = 'password'; //property that toggles the password input field type between 'text' and 'password'


 signInErrorMessage :string = '';

 opacity = 0; //display effect login success check mark

 timer:any; //opacity effect timer
 



  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router  ) {
    afterNextRender(() => {

      // gives one-time focus to the email input field
     this.emailInput.nativeElement.focus();
    });
  }

  @ViewChild(MatCheckbox) adminCheckbox!:MatCheckbox; //check box


  ngOnDestroy(): void {
    clearInterval(this.timer);

    document.removeEventListener('click', this.globalClickHandler);
  }

  // Handler reference for proper cleanup
  private globalClickHandler = (event: MouseEvent) => {
    if (!this.emailInput.nativeElement.contains(event.target as Node)) {
      this.emailInput.nativeElement.blur();
    }
  };

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
      error:(err) => {

        
       if(err.status === HttpStatusCode.NotAcceptable){
       


        //  Notify them that their account was disabled
        this.router.navigate(['/disabled'])
       }

       else{

        const element = document.getElementById('error');
        if(element){

          element.classList.remove('hidden');
          // I discovered when server is down, error message would be an object {'isTrusted':true}, when serialized
         this.signInErrorMessage = typeof err.error !== 'object' ? err.error : 'Server not responding!';
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
      },
     
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

      return this.authService.isLoggedIn;
    }
}
