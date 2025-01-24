import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Institution, InstitutionService } from '../institution.service';
import { take } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-institution-registration',
  templateUrl: './institution-registration.component.html',
  styleUrl: './institution-registration.component.css'
})
export class InstitutionRegistrationComponent implements OnInit {



  registrationSuccessful = false;


  registrationForm?:FormGroup;

  // an array of states
  states:string[] = [];

  // LGA for the currently selected state
  localGovts:string[] = [];


  constructor(private fb:FormBuilder, private institionService:InstitutionService,
    private router:Router
  ){}
 
  ngOnInit(): void {

    this.createRegistrationForm();

    this.processStateChangeEvent();
    this.processNameChange()
    
  }

  

    onSubmit() {

      let institution:Institution = this.registrationForm!.value

      // resets the fields
      this.localGovt.setValue('');
      this.state.setValue('');
      this.institutionName.setValue('')

      
      this.institionService.registerInstitution(institution).pipe(take(1)).subscribe({
        next:(val) => {

          if(val.status === HttpStatusCode.Ok){

            this.registrationSuccessful = true;
           

            const el = document.getElementById('thumpsIcon');
            if(el){

             

              el.classList.remove('hide')
              // displays the thumps up icon indicating successful account registration
              el.classList.add('thumpsUp');
              

              setTimeout(() => {

                this.registrationSuccessful = !this.registrationSuccessful;
               
                el.classList.remove('thumpsUp')
                el.classList.add('hide')
                
              }, 10000);
            }


          }
        },
        error:(err) => {

          

          err.error === 'already exists' ? this.router.navigate(['/error', 'account already exists']) : this.router.navigate(['/error',''])
          
        }
      })



   
      
    }

   

  private createRegistrationForm(){

    this.registrationForm =  this.fb.group({

      name:new FormControl<string>('',{
  
        validators: [Validators.required]
      }),
  
      state:new FormControl<string>('',{
        validators:[Validators.required]
      }),

      localGovt:new FormControl<string>('', {

        validators:[Validators.required]
      }),
  
      createdBy: new FormControl<number>(this.adminId)
    })

    this.getStates();

  }

  private get adminId(){

    return Number(sessionStorage.getItem('adminId')!)
  }

  private get state():FormControl{

    return this.registrationForm!.get('state') as FormControl;
  }

  private get institutionName():FormControl{

    return this.registrationForm!.get('name') as FormControl;
  }

  private get localGovt():FormControl{

    return this.registrationForm!.get('localGovt') as FormControl;
  }

  processNameChange() {

    const regex = /^[^a-zA-Z0-9]/;
   
    // flag that prevents recursive event emission each time value change event is detected
    let isSettingValue = false;
  
    this.institutionName.valueChanges.subscribe(_ => {
      if (isSettingValue) {
        return;
      }
  
      if (!isNaN(this.institutionName.value) || regex.test(this.institutionName.value)) {
        isSettingValue = true;
        this.institutionName.setValue('');
        isSettingValue = false;
      }
    });
  }
  

  private getLocalGovts(){

    this.localGovts = []; //resets array
    this.localGovt.setValue(''); //resets previously selected value

    const data =  this.institionService.getLGA(this.state.value);
    if(data){
    this.localGovts = data; //repopulate localGovt array

    }

  }

 private  getStates(){

    const data = this.institionService.states;

    this.states = data;
  }

  private processStateChangeEvent(){

    this.state.valueChanges.subscribe(evt => this.getLocalGovts());
  }

  canSubmit():boolean{

    return this.institutionName.value  && this.localGovt.value  && this.state.value 


  }

  

  // method that routes to the 'AddStudentComponent' to associate students to an institution
  addStudent() {

    this.router.navigate(['/add_student',this.adminId])
   

    }
    
}
