import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Institution, InstitutionService } from '../../institution.service';
import { take } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';

@Component({
    selector: 'app-add-student',
    templateUrl: './add-student.component.html',
    styleUrls: ['./add-student.component.css'],
    standalone: true,
    imports: [NgIf, MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, NgFor, MatOption, MatInput, MatIconButton, MatSuffix, MatButton, RouterLinkActive, RouterLink]
})
export class AddStudentComponent implements OnInit {


  adminId?: number;
  institutions: Institution[] = [];
  addStudentForm: FormGroup;
  selectedInstitution?: number;
  hasFormError = true;
  
  // dynamic input type for both password and text. Provides access to password visibility
  dynamicType = 'password';

  passwordState = 0;

  private inputType = ['password','text']
  
  constructor(
    private activatedRoute: ActivatedRoute, 
    private institutionService: InstitutionService,
    private router: Router, 
    private fb: FormBuilder
  ) { 
    this.addStudentForm = this.fb.group({
      records: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('admin');
      if (id) {
        this.adminId = Number(id);
        this.getInstitutions(this.adminId);
      } else {
        history.back();
      }
    });


    this.records.valueChanges.subscribe(_=> this.processFormForErrors())
  }

  get records(): FormArray {
    return this.addStudentForm.get('records') as FormArray;
  }

  private createRecord(): FormGroup {
    return this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  addRecord(): void {
    this.records.push(this.createRecord());
  }

  deleteRecord(index: number): void {
    this.records.removeAt(index);
  }

  private getInstitutions(adminId: number): void {
    this.institutionService.getRegisteredInstitutions(adminId).subscribe({
      next: (data: Institution[]) => {
        this.institutions = data;
      },
      error: err => {
        const errorPath = err.error === 'Number format error' ? err.error : '';
        this.router.navigate(['/error', errorPath]);
      }
    });
  }

  togglePasswordVisibility() {

   

    if(this.passwordState >= 1){

      -- this.passwordState;
      this.dynamicType = this.inputType[this.passwordState];

    }else {

      ++this.passwordState;
      this.dynamicType = this.inputType[this.passwordState];

    }

    
    
    

    
   
    
   
  
  }

  onSubmit(): void {
    if (this.addStudentForm.valid) {
     
      const records = [...this.addStudentForm.value.records]
      this.records.clear();

    

      this.institutionService.addStudentRecords(this.selectedInstitution!, records)
      .pipe(take(1)).subscribe({

        next:(response) => {

          if(response.status ===  HttpStatusCode.Ok){

            // display the success thumbs up

            const el = document.getElementById('thumpsIcon');
            if(el){

              el.classList.remove('hide');

              el.classList.add('thumpsUp');

              setTimeout(() => {
                
                el.classList.remove('thumpsUp');
                el.classList.add('hide');

              }, 10000);
            }
          }

        },
        error:(err) => {

          switch (err.error) {
            case 'Email and or password error':

            this.router.navigate(['/error','A likely invalid record'])
              
              break;

              case 'some records already exist':

              this.router.navigate(['/error','Attempt to add existing record(s)'])

              break;
          
            default:

            this.router.navigate(['/error',''])
              break;
          }
       }
      })

      
    } 

    
   


  }

  private processFormForErrors(): void {
    
    let error = false;
   

    for (let index = 0; index < this.records.length; index++) {
     
      const control = this.records.at(index);

      if(control.invalid){

        error = true;
        break;
      }


    }

    this.hasFormError = error;
  }

}

export interface StudentRecord{
  username:string,
  password:string
}
