import { Component, OnInit } from '@angular/core';
import { AssignmentService } from '../assignment.service';
import { Institution, InstitutionService } from '../institution.service';
import { range, take, toArray } from 'rxjs';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css',
  providers:[provideNativeDateAdapter()]
})
export class AssignmentComponent implements OnInit {


deleteRecord(_t229: number) {
throw new Error('Method not implemented.');
}
today = new Date();
onSubmit() {
throw new Error('Method not implemented.');
}

  institutions:Institution[] = [];
  assignmentForm?:FormGroup;
   _assignmentType = ['objectives','theory','pdf'];
   _totalQuestion?:number;
   categories = ['junior','senior'];

   private isPdfSelected = false;

  //  stores an array of number matching question number according to the number of question admin wants to ask
   countStore:number[] = []





  constructor(private assignmentService:AssignmentService, private institutionService:InstitutionService,

    private router:Router, private fb:FormBuilder, private authService:AuthService
  ){

    this.assignmentForm = this.fb.group({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      admin: new FormControl(null),
      subject: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      institution: new FormControl(null, Validators.required),
      allocatedMark: new FormControl(null, Validators.required),
      totalQuestion: new FormControl(null, [Validators.required, Validators.min(1)]),
      creationDate: new FormControl(new Date()),
      submissionEnds: new FormControl(null, Validators.required),
      assignment: this.fb.array([])
    });
    
  }

  ngOnInit(): void {
   
    const adminId = this._adminId;
    if(adminId){

      // get admin's registered institutions
      this.getRegisteredInstitutions(adminId);

    }



   this.numberOfQuestionsChange();
   this.processFormChanges()

  }

  // whether the submit button should be disabled or not
  get shouldDisable(): boolean{

   let isValid = false;
   if(this.type.value !== 'pdf'){

    isValid = !this.assignment.invalid;

   }else{

    isValid = this.isPdfSelected;
   }

   return !this.validForm() //&& !isValid

  }

  onFileSelected(fileInput: HTMLInputElement) {

    if(fileInput && fileInput.files?.length){

      this.isPdfSelected = true;
    }else{

      this.isPdfSelected = false;
    }

    

    }

  // fetches admin's registered institutions
  private getRegisteredInstitutions(adminId:number){

   const institutions =  this.institutionService.getInstitutions(adminId);

   institutions ? this.institutions = institutions 
   
                  : 
   
   this.institutionService.getRegisteredInstitutions(adminId).pipe(take(1)).subscribe({

    next: (val) => this.institutions = val,

    error: () => this.router.navigate(['/error']),

    complete:() => {

      // process if the admin has registered institutions
      if(this.institutions?.length || this.isSuperAdmin){

        this.assignmentForm?.get('admin')?.setValue(adminId);
         
      }else{

        this.router.navigate(['/register','acion_needed'])
      }
    }

    })


  }

  get assignment(): FormArray {

    return (this.assignmentForm?.get('assignment') as FormArray) || this.fb.array([]);
  }

  private get type():FormControl{

    return this.assignmentForm?.get('type') as FormControl;
  }

  private get institution(): FormControl{

    return this.assignmentForm?.get('institution') as FormControl;
    
  }

  processFormChanges(){

    // resets assignments on type selection change
    this.type.valueChanges.subscribe(change => this.assignment.clear())


  }
  

  private createObjQuestion():FormGroup{

    return this.fb.group({

      _index:new FormControl<number|undefined>(this.countStore.shift(),[Validators.required]),
      problem:new FormControl<string|undefined>(undefined, [Validators.required]),
      options:this.options,
      answer:new FormControl<string|undefined>(undefined,[Validators.required])
    })


  }

  // dynamically create question options for the objective questions
  private get options():FormGroup{

    return this.fb.group({
      A:new FormControl<string|undefined>(undefined, [Validators.required]),
      B:new FormControl<string|undefined>(undefined, [Validators.required]),
      C:new FormControl<string|undefined>(undefined, [Validators.required]),
      D:new FormControl<string|undefined>(undefined, [Validators.required]),

    })
  }

  private createTheoryQuestion():FormGroup{

    return this.fb.group({

      _index:new FormControl<number|undefined>(this.countStore.shift(),[Validators.required]),
      problem:new FormControl<string|undefined>(undefined, [Validators.required]),
      answer:new FormControl<string|undefined>(undefined,[Validators.required])
    })
  }

  // processes and return the type of assignment being set (e.g objectives, theory or pdf)
  private get assignmentType():string{

    return (this.assignmentForm?.get('type') as FormControl).value



  }

  // dynamically adds question based on the assignment type
  public addQuestion(){

    switch (this.assignmentType) {
      case 'objectives':

      console.log('objectives clicked')

      this.assignment.push(this.createObjQuestion())
        
        break;

        case 'theory':

        console.log('thery clicked')
          this.assignment.push(this.createTheoryQuestion())

          break;
    
      case 'pdf' :

      throw new Error('Not implemented.');
        break;
    }


  }
  private numberOfQuestionsChange(){

    

   if(this.totalQuestion){
    this.totalQuestion.valueChanges.subscribe(val => {

      // returns a range of numbers from 1 to the inputed number, then stores in the countStore
      range(1, this.totalQuestion.value).pipe(toArray()).subscribe(val => this.countStore.push(...val))




    })

   }

  }

  private get totalQuestion():FormControl{

    return this.assignmentForm?.get('totalQuestion') as FormControl;
  }

  private get name():FormControl{

    return this.assignmentForm?.get('name') as FormControl;
  }

  private get subject():FormControl{

    return this.assignmentForm?.get('subject') as FormControl;
  }

  private get category():FormControl{

    return this.assignmentForm?.get('category') as FormControl;
  }

  private get allocatedMark():FormControl{

    return this.assignmentForm?.get('allocatedMark') as FormControl;
  }

  private get submissionEnds():FormControl{

    return this.assignmentForm?.get('submissionEnds') as FormControl;
  }

  private validForm():boolean{

    return (!this.name.invalid && !this.type.invalid && !this.subject.invalid
           && !this.category.invalid && !this.institution.invalid && !this.totalQuestion.invalid
           && !this.allocatedMark.invalid)

  }



  private get isSuperAdmin(){

    return this.authService.isSuperAdmin();

  }


  private get _adminId(){

    return Number(sessionStorage.getItem('adminId'));
  }
}
