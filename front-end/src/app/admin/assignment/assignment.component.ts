import { Component, OnInit } from '@angular/core';
import { AssignmentService } from '../assignment.service';
import { Institution, InstitutionService } from '../institution.service';
import { range, Subject, take, toArray } from 'rxjs';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css'
})
export class AssignmentComponent implements OnInit {
onSubmit() {
throw new Error('Method not implemented.');
}

  institutions?:Institution[];
  assignmentForm?:FormGroup;

   _assignmentType = ['objectives','theory','pdf'];
   _totalQuestion?:number;

  //  stores an array of number matching question number according to the number of question admin wants to ask
   countStore:number[] = []





  constructor(private assignmentService:AssignmentService, private institutionService:InstitutionService,

    private router:Router, private fb:FormBuilder, private authService:AuthService
  ){}

  ngOnInit(): void {
   
    const adminId = this._adminId;
    if(adminId){

      // get admin's registered institutions
      this.getRegisteredInstitutions(adminId);

    }



    this.numberOfQuestionsChange();

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

        this.assignmentForm = this.fb.group({

          name: new FormControl<string>('', Validators.required),
          type:new FormControl<string>('',Validators.required), //drop box
          admin:new FormControl<number>(adminId),
          subject:new FormControl<string>('',Validators.required),
          category:new FormControl<string>('',Validators.required),//drop box
          institution:new FormControl<number|undefined>(undefined, Validators.required),
          allocatedMark:new FormControl<number|undefined>(undefined, Validators.required),
          totalQuestion:new FormControl<number|undefined>(undefined,[Validators.required, Validators.min(1)]),
          creationDate:new FormControl<Date>(new Date()),
          submissionEnds:new FormControl<Date|undefined>(undefined, Validators.required),
          assignment:this.fb.group([])



        })


      }else{

        this.router.navigate(['/error','please register your institution first and add your students.'])
      }
    }

    })


  }

  private get assignment():FormArray{

    return this.assignmentForm?.get('assignment') as FormArray;
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

      this.assignment.push(this.createObjQuestion())
        
        break;

        case 'theory':
          this.assignment.push(this.createTheoryQuestion())

          break;
    
      case 'pdf' :

      throw new Error('Not implemented.');
        break;
    }


  }
  private numberOfQuestionsChange(){

    

    this.totalQuestion.valueChanges.subscribe(val => {

      // returns a range of numbers from 1 to the inputed number, then stores in the countStore
      range(1, this.totalQuestion.value).pipe(toArray()).subscribe(val => this.countStore.push(...val))




    })


  }

  private get totalQuestion():FormControl{

    return this.assignmentForm?.get('totalQuestion') as FormControl;
  }




  private get isSuperAdmin(){

    return this.authService.isSuperAdmin();

  }


  private get _adminId(){

    return Number(sessionStorage.getItem('adminId'));
  }
}
