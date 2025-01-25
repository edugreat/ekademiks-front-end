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
  providers: [provideNativeDateAdapter()]
})
export class AssignmentComponent implements OnInit {

  today = new Date();


  disable = true;

  institutions: Institution[] = [];
  assignmentForm?: FormGroup;
  _assignmentType = ['objectives', 'theory', 'pdf'];
  _totalQuestion?: number;
  categories = ['junior', 'senior'];

  objOptions = ['A', 'B', 'C', 'D']

  private isPdfSelected = false;

  hideIcon = false

  startPageIndex = 0;
  endPageIndex = 0;
  PAGE_SIZE = 4;
  currentPageIndex = 0;



  //  stores an array of number matching question number according to the number of question admin wants to ask
  countStore: number[] = []






  constructor(private assignmentService: AssignmentService, private institutionService: InstitutionService,

    private router: Router, private fb: FormBuilder, private authService: AuthService
  ) {

    this.assignmentForm = this.fb.group({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      admin: new FormControl(null),
      subject: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      institution: new FormControl(null, Validators.required),
      allocatedMark: new FormControl<number | undefined>(undefined, [Validators.required]),
      totalQuestion: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1)]),
      creationDate: new FormControl(new Date()),
      submissionEnds: new FormControl(null, Validators.required),
      assignment: this.fb.array([])
    });

  }

  ngOnInit(): void {

    const adminId = this._adminId;
    if (adminId) {

      // get admin's registered institutions
      this.getRegisteredInstitutions(adminId);

    }




    this.processFormChanges();



  }

  // whether the submit button should be disabled or not
  get shouldDisable(): boolean {

    let isValid = false;
    if (this.type.value !== 'pdf') {

      // returns false if the assignment formGroup is yet empty, else process the controls for validity
      isValid = this.isAssignmentValid;

    } else {

      isValid = this.isPdfSelected;
    }


    return !this.validForm() || !isValid

  }

  onFileSelected(fileInput: HTMLInputElement) {

    if (fileInput && fileInput.files?.length) {

      this.isPdfSelected = true;
    } else {

      this.isPdfSelected = false;
    }



  }

  // fetches admin's registered institutions
  private getRegisteredInstitutions(adminId: number) {

    const institutions = this.institutionService.getInstitutions(adminId);

    institutions ? this.institutions = institutions

      :

      this.institutionService.getRegisteredInstitutions(adminId).pipe(take(1)).subscribe({

        next: (val) => this.institutions = val,

        error: () => this.router.navigate(['/error']),

        complete: () => {

          // process if the admin has registered institutions
          if (this.institutions?.length || this.isSuperAdmin) {

            this.assignmentForm?.get('admin')?.setValue(adminId);

          } else {

            this.router.navigate(['/register', 'acion_needed'])
          }
        }

      })


  }

  get assignment(): FormArray {

    return (this.assignmentForm?.get('assignment') as FormArray) || this.fb.array([]);
  }

  private get isAssignmentValid(): boolean {

    let validity = true;

    if (this.assignment.length) {

      for (let index = 0; index < this.assignment.length; index++) {

        if (this.assignment.at(index).invalid) {

          validity = false;
          break;
        }

      }


    } else validity = false;




    return validity;
  }

  get type(): FormControl {

    return this.assignmentForm?.get('type') as FormControl;
  }

  private get institution(): FormControl {

    return this.assignmentForm?.get('institution') as FormControl;

  }

  processFormChanges() {

    // resets assignments on type selection change
    this.type.valueChanges.subscribe(change => this.assignment.clear());


    this.processMarkAllocationChanges();






  }

  // returns the highest question nunber set so far
  get highestIndex(): number | undefined {


    return this.assignment.at(this.assignment.length - 1) ? this.assignment.at(this.assignment.length - 1).get('_index')?.value : undefined


  }


  private createObjQuestion(): FormGroup {

    // check if countStore.length < highest _index control for assignment form array


    return this.fb.group({

      _index: new FormControl<number | undefined>(this.countStore.shift(), [Validators.required]),
      problem: new FormControl<string | undefined>(undefined, [Validators.required]),
      options: this.options,
      answer: new FormControl<string | undefined>(undefined, [Validators.required])
    })


  }

  // delete assignment question at the given index
  deleteQuestion(index: number) {

    this.assignment.removeAt(index);


  }

  // dynamically create question options for the objective questions
  private get options(): FormGroup {

    return this.fb.group({
      A: new FormControl<string | undefined>(undefined, [Validators.required]),
      B: new FormControl<string | undefined>(undefined, [Validators.required]),
      C: new FormControl<string | undefined>(undefined, [Validators.required]),
      D: new FormControl<string | undefined>(undefined, [Validators.required]),

    })
  }

  private createTheoryQuestion(): FormGroup {

    return this.fb.group({

      _index: new FormControl<number | undefined>(this.countStore.shift(), [Validators.required]),
      problem: new FormControl<string | undefined>(undefined, [Validators.required]),
      answer: new FormControl<string | undefined>(undefined, [Validators.required])
    })
  }

  // processes and return the type of assignment being set (e.g objectives, theory or pdf)
  private get assignmentType(): string {

    return (this.assignmentForm?.get('type') as FormControl).value



  }

  // dynamically adds question based on the assignment type
  public addQuestion() {

    switch (this.assignmentType) {
      case 'objectives':



        this.assignment.push(this.createObjQuestion())
        this.processPagination()


        break;

      case 'theory':


        this.assignment.push(this.createTheoryQuestion())
         this.processPagination()

        break;

      case 'pdf':

        throw new Error('Not implemented.');
        break;
    }


  }


  nextPage() {

  }

  previousPage() {


  }

  private processPagination(){

    if(this.assignment.length < this.PAGE_SIZE) {
      this.endPageIndex = this.assignment.length;
      this.currentPageIndex = this.endPageIndex - 1;
    }
     else {
      this.startPageIndex = this.currentPageIndex + 1;

      if(this.startPageIndex + this.PAGE_SIZE < this.assignment.length){

        this.endPageIndex = this.currentPageIndex + this.PAGE_SIZE;
      }else{

        const difference = this.startPageIndex + this.PAGE_SIZE - this.assignment.length;
        this.endPageIndex = this.startPageIndex+difference;

        this.currentPageIndex = this.endPageIndex;
      }
      // this.endPageIndex = this.startPageIndex + this.PAGE_SIZE;
      // this.currentPageIndex = this.assignment.length - 1;
     }

  console.log(`start: ${this.startPageIndex}, end: ${this.endPageIndex}`)
    
  }


  // processes change in the mark allocation form input
  processMarkAllocationChanges() {

    // sentinel that prevents recursive change event firings

    let isSetting = false;


    this.allocatedMark.valueChanges.subscribe(val => {

      if (!isSetting && (isNaN(val) || val <= 0)) {

        isSetting = true;
        this.allocatedMark.setValue(undefined);

        // remove previously added numbers
        this.countStore.splice(0);

        isSetting = false;

      }


    })

  }

  toggleHide() {

    this.hideIcon = !this.hideIcon
    //this.totalQuestion.enable()

  }
  processTotalQuestionChanges(input: HTMLInputElement) {
    this.hideIcon = true;

    // guards against unnecessary code execution where changes were not made
    if (this._totalQuestion === Number(input.value)) return;
    else this._totalQuestion = Number(input.value);




    // process when the user enters non numeric values or values less than or equal to zero
    if (isNaN(Number(input.value)) || Number(input.value) <= 0) {


      this.totalQuestion.setValue(undefined);



    } else { //process when positive non-zero integer has been entered



      // get the highest question number already asked or zero if non
      let startFrom = this.highestIndex || 0;

      let count = Number(input.value);

      if (this.highestIndex && this.highestIndex < count) {
        count -= this.highestIndex;

      }

      // clears the array before populating if non of the initially populated numbers have been used.
      // This is to avoid having duplicate entries
      if (startFrom === 0 && this.countStore.length) this.countStore = [];

      // populate the countStore
      range(startFrom + 1, count).pipe(toArray()).subscribe(val => this.countStore.push(...val));

    }


    if (!input.value) {

      // empty the array if number of questions got cleared
      this.countStore = [];
    }


    // this.totalQuestion.disable()
  }


  private get totalQuestion(): FormControl {

    return this.assignmentForm?.get('totalQuestion') as FormControl;
  }

  private get name(): FormControl {

    return this.assignmentForm?.get('name') as FormControl;
  }

  private get subject(): FormControl {

    return this.assignmentForm?.get('subject') as FormControl;
  }

  private get category(): FormControl {

    return this.assignmentForm?.get('category') as FormControl;
  }

  private get allocatedMark(): FormControl {

    return this.assignmentForm?.get('allocatedMark') as FormControl;
  }

  private get submissionEnds(): FormControl {

    return this.assignmentForm?.get('submissionEnds') as FormControl;
  }

  private validForm(): boolean {

    return (!this.name.invalid && !this.type.invalid && !this.subject.invalid
      && !this.category.invalid && !this.institution.invalid && !this.totalQuestion.invalid
      && !this.allocatedMark.invalid && !this.submissionEnds.invalid)

  }

  postAssignment() {

    console.log(`${JSON.stringify(this.assignmentForm?.value, null, 1)}`)
  }


  private get isSuperAdmin() {

    return this.authService.isSuperAdmin();

  }


  private get _adminId() {

    return Number(sessionStorage.getItem('adminId'));
  }
}
