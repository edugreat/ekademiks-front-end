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

  private isPdfSelected = true;

  hideIcon = false

  startingPageIndex = 0; //starting index for slice pipe
  endingPageIndex = 0;  // ending index for slice pipe
  PAGE_SIZE = 4;    // default page size
  
  currentPage = -1; // the current page at which we're
  totalPage = 0;

  



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
    this.assignmentTypeChange();


    this.processMarkAllocationChanges();

    this.processTotalQuestionChange();
    






  }

  private assignmentTypeChange() {
    this.type.valueChanges.subscribe(change => {
      
      this.assignment.clear();
      this.resetPagination();


    });
  }

  private resetPagination(){

    this.currentPage = -1;
    this.startingPageIndex = 0;
    this.endingPageIndex = 0;
    this.totalPage = 0;
    this._totalQuestion = undefined;

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
        // this.processPagination()


        break;

      case 'theory':


        this.assignment.push(this.createTheoryQuestion())
         

        break;

      case 'pdf':

        throw new Error('Not implemented.');
        break;
    }

    this.processPagination();


  }


  nextPage() {

    if((this.currentPage + 1) === this.totalPage) return;

    this.currentPage++;
    this.endingPageIndex = (1 + this.currentPage)*this.PAGE_SIZE;

    console.log(`current page: ${this.currentPage} : ending page: ${this.endingPageIndex}`)
  }

  previousPage() {

    if((this.currentPage - 1) === -1) return;

    this.currentPage--;

    this.endingPageIndex = (1 + this.currentPage) * this.PAGE_SIZE;


    console.log(`...current page: ${this.currentPage} : ending page: ${this.endingPageIndex}`)
  }

  private  computeTotalPages() {
   
    const _totalPages = this.assignment.length;
    if(_totalPages > 0 && _totalPages < this.PAGE_SIZE) this.totalPage = 1;
   const quotient = Math.floor(_totalPages / this.PAGE_SIZE);
    const remainder = _totalPages % this.PAGE_SIZE;
  
    this.totalPage = quotient + (remainder > 0 ? 1 : 0);

    

    }

  private processPagination(){

    // while array length is less than pageSize, endingPageIndex = pageSize
   
    // maintain startingPageIndex and curentPage at default values of 0
    const arraySize = this.assignment.length;
    if(arraySize <= this.PAGE_SIZE){
     
      this.endingPageIndex = this.PAGE_SIZE;
      this.currentPage = 0;

    }

    // else:
    // get the current array size

    // get the current page by running Math.floor(array size / page size)
     
    // Determine if the page has reached page size by running (arraySize)%pageSize

    // Increment current page if modulo operation returns non-zero value, or decrement the value if modulo returns zero

    // Update startingPageIndex according by executing startingPageIndex = currentPage * pageSize, for array slice operation

    // Update last page index accordingly by execting lastPageIndex = startingPageIndex + pageSize, for array slice operation




    else{

      const floor = Math.floor(arraySize / this.PAGE_SIZE);

      const remainder = arraySize % this.PAGE_SIZE;

     
      if(remainder > 0) this.currentPage = floor;
      else this.currentPage = floor - 1;

      this.startingPageIndex = this.currentPage * this.PAGE_SIZE;
      this.endingPageIndex = this.startingPageIndex + this.PAGE_SIZE;



    }

   
    this.computeTotalPages();

    
    
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

    const currentTotal = Number(input.value);
    this.hideIcon = true;

    // guards against unnecessary code execution where changes were not made
    if (this._totalQuestion === currentTotal) return;
    else this._totalQuestion = currentTotal;




    // process when the user enters non numeric values or values less than or equal to zero
    if (isNaN(Number(input.value)) || currentTotal <= 0) {


      this.totalQuestion.setValue(undefined);
      this.countStore = [];
      return;



    } else { //process when positive non-zero integer has been entered

      if(currentTotal < this._totalQuestion){

        this.assignment.clear();
        
      }


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
      this._totalQuestion += count; //update the total number of questions to ask

    }

    
  }
  

  deleteAssignmentAt(index: number) {

    if(this.assignment.at(index)) this.assignment.removeAt(index);
   
  }

  private get totalQuestion(): FormControl {

    return this.assignmentForm?.get('totalQuestion') as FormControl;
  }

  private processTotalQuestionChange(){

    let isProcessing = false;
    this.totalQuestion.valueChanges.subscribe(val => {
     if(isProcessing)return;

     isProcessing = true;
     if(isNaN(val))this.totalQuestion.setValue(undefined);
     else this.totalQuestion.setValue(val)

     isProcessing = false;
     

    })

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
