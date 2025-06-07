import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AssignmentDetails, AssignmentService } from '../assignment.service';
import { Institution, InstitutionService } from '../institution.service';
import { range, Subscription, take, toArray } from 'rxjs';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, User } from '../../auth/auth.service';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatDatepickerInputEvent, MatDatepickerInput, MatDatepickerToggle, MatDatepickerToggleIcon, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor, UpperCasePipe, SlicePipe } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DragDirective } from './drag.directive';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';

@Component({
    selector: 'app-assignment',
    templateUrl: './assignment.component.html',
    styleUrl: './assignment.component.css',
    providers: [provideNativeDateAdapter()],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, NgFor, MatOption, MatIcon, MatTooltip, MatSuffix, MatDatepickerInput, MatHint, MatDatepickerToggle, MatDatepickerToggleIcon, MatDatepicker, MatButton, MatIconButton, DragDirective, MatRadioGroup, MatRadioButton, MatPaginator, UpperCasePipe, SlicePipe]
})
export class AssignmentComponent implements OnInit, OnDestroy {



  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('submitBtn')submitBtn!:HTMLButtonElement;


  // warning received from the child's directive when the wrong file type is dropped
  fileDroppedWarning = '';

  today = new Date().setHours(0,0,0,0);

  submissionDate = new Date();
  


  disable = true;

  institutions: Institution[] = [];
  assignmentForm?: FormGroup;
  _assignmentType = ['objectives', 'theory', 'pdf'];
  _totalQuestion?: number;
  categories = ['junior', 'senior'];

  objOptions = ['A', 'B', 'C', 'D']

  isPdfSelected = false;

  // name of the selected pdf 
  fileName = ''

 _readonly = false;

  showSendBtn = false;
  showEditBtn = false;
 

  typeOfPDF = ['Objectives', 'Theory', 'Both'];
  selectedPdfType = '';

  fileToUpload?: File;


  sublistStart = 0;
  sublistEnd = 0;

  totalPage = 0;

  // current page index
  pageIndex = 0;


  //  stores an array of number matching question number according to the number of question admin wants to ask
  countStore: number[] = []

  // an instance of currently logged in user
  currentUser?:User;

  currentUserSub?: Subscription;


  constructor(private assignmentService: AssignmentService, private institutionService: InstitutionService,
    public paginatorIntl: MatPaginatorIntl,

    private router: Router, private fb: FormBuilder, private authService: AuthService
  ) {

    this.submissionDate.setDate(this.submissionDate.getDate()+1);
    
    this.assignmentForm = this.fb.group({
      id:new FormControl(0),
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      institution: new FormControl(null, Validators.required),
      allocatedMark: new FormControl<number | undefined>(undefined, [Validators.required]),
      totalQuestion: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1)]),
      creationDate: new FormControl(new Date()),
      submissionEnds: new FormControl(this.submissionDate, Validators.required),
      assignment: this.fb.array([])
    });

  }

  ngOnInit(): void {

    this._currentUser()
    

    // customize paginator's label
    this.paginatorIntl.itemsPerPageLabel = 'Questions per page:';
    this.paginatorIntl.changes.next();


    this.processFormChanges();


  }

  ngOnDestroy(): void {
    
    this.currentUserSub?.unsubscribe();
  }



  // updates pagination when assignments are being added
  private updatePagination() {

    const pageSize = this.paginator.pageSize;

    // start parameter of slice pipe
    this.sublistStart = (Math.ceil(this.assignment.length / pageSize) - 1) * pageSize;

    // end parameter of slice pipe
    this.sublistEnd = this.sublistStart + pageSize;

    // current page index
    this.pageIndex = Math.ceil(this.assignment.length / pageSize) - 1;


    // programmatically update paginator's page index
    this.paginator.pageIndex = this.pageIndex;


  }



  // method that gets called on page index change
  onPageChange(event: PageEvent): void {


    //const totalPage = Math.ceil(this.assignment.length / this.paginator.pageSize);

    this.pageIndex = this.paginator.pageIndex;

    this.sublistStart = this.pageIndex * this.paginator.pageSize;

    this.sublistEnd = this.sublistStart + this.paginator.pageSize;


  }



  // whether the submit button should be disabled or not
  get shouldDisable(): boolean {

    let isValid = false;
    if (this.type.value !== 'pdf') {

      // returns false if the assignment formGroup is yet empty, else process the controls for validity
      isValid = this.isAssignmentValid;

    } else {

      isValid = this.isPdfSelected && this.selectedPdfType.length > 0;
    }

    

    return this.invalidForm() || !isValid

  }

  onFileSelected(fileInput: HTMLInputElement) {

   

    if (fileInput.files?.length) {

      this.fileToUpload = fileInput.files[0];

    }
    if (fileInput && fileInput.files?.length) {

    
      this.fileName = Array.from(fileInput.files).map(file => file.name).join('');

      if(this.fileName.split('.').pop()?.toLowerCase() !== 'pdf'){

        this.fileDroppedWarning = 'Requires PDF file only';
        this.isPdfSelected = false;
        this.fileToUpload = undefined;
        this.fileName = '';
        return;
      }else{


      this.isPdfSelected = true;
      this.fileDroppedWarning = ''

      }
   
   
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
          if (this.institutions?.length) {




          } else {

            this.router.navigate(['/register', 'action_needed'])
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




    return this.assignment.length > 0 && this.assignment.length === Number(this.totalQuestion.value) && validity;
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



    });
  }


  // returns the highest question nunber set so far
  get highestIndex(): number | undefined {


    return this.assignment.at(this.assignment.length - 1) ? this.assignment.at(this.assignment.length - 1).get('_index')?.value : undefined


  }


  private createObjQuestion(): FormGroup {

   
    return this.fb.group({
       
      type:new FormControl('objectives'),
      _index: new FormControl<number | undefined>(this.countStore.shift(), [Validators.required]),
      problem: new FormControl<string | undefined>(undefined, [Validators.required]),
      options: this.options,
      answer: new FormControl<string | undefined>(undefined, [Validators.required])
    })


  }

  // delete assignment question at the given index
  deleteQuestion(index: number) {

   
    this.assignment.removeAt(index);

    this.updatePagination();


  }

  // dynamically create question options for the objective questions
  public get options(): FormGroup {

    return this.fb.group({
      A: new FormControl<string | undefined>(undefined, [Validators.required]),
      B: new FormControl<string | undefined>(undefined, [Validators.required]),
      C: new FormControl<string | undefined>(undefined, [Validators.required]),
      D: new FormControl<string | undefined>(undefined, [Validators.required]),

    })
  }

  private createTheoryQuestion(): FormGroup {

    return this.fb.group({


      type: new FormControl('theory'),
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

        break;

      case 'theory':


        this.assignment.push(this.createTheoryQuestion())


        break;

     
    }

    this.updatePagination();


  }

  get previousPageDisabled(): boolean {
    return this.assignment.length < this.totalQuestion.value
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

  
  processTotalQuestionChanges(input: HTMLInputElement) {

    const currentTotal = Number(input.value);
   
   this.showSendBtn = false;
   this.showEditBtn = true;
   this._readonly = true;

   

    

    // guards against unnecessary code execution where changes were not made
    if (this._totalQuestion === currentTotal) return;
    else this._totalQuestion = currentTotal;




    // process when the user enters non numeric values or values less than or equal to zero
    if (currentTotal <= 0) {


      this.totalQuestion.setValue(undefined);
      this.countStore = [];
      return;



    } else { //process when positive non-zero integer has been entered

      if (currentTotal < this._totalQuestion) {

        this.assignment.clear();

      }


      // get the highest question number already asked or zero if non
      let startFrom = this.highestIndex || 0;

      // used to process the rxjs range to populate the countStore variable
      let rangeCount = currentTotal;

      if (this.highestIndex && this.highestIndex < currentTotal) {

        rangeCount -= this.highestIndex;

      }

      // clears the array before populating if non of the initially populated numbers have been used.
      // This is to avoid having duplicate entries
      if (startFrom === 0 && this.countStore.length) this.countStore = [];

      // populate the countStore
      range(startFrom + 1, rangeCount).pipe(toArray()).subscribe(val => this.countStore.push(...val));
      this._totalQuestion += rangeCount; //update the total number of questions to ask

    }


  }


  deleteAssignmentAt(index: number) {

    if (this.assignment.at(index)) {
      this.assignment.removeAt(index);


    }

  }

  private get totalQuestion(): FormControl {

    return this.assignmentForm?.get('totalQuestion') as FormControl;
  }

  private processTotalQuestionChange() {

    let isProcessing = false;
    this.totalQuestion.valueChanges.subscribe(val => {
      if (isProcessing) return;

      isProcessing = true;
      if (!val || isNaN(val)) {
        
        this.totalQuestion.setValue(undefined);
       this.showSendBtn = false;
      

       isProcessing = false;
   
  
      }
      else {

        this.totalQuestion.setValue(val)
      
       this.showSendBtn = true;
      
        isProcessing = false;
      }

      


    })

  }


  editTotalQuestion() {

    this.showEditBtn = false;
   
    this.showSendBtn = true;

    this._readonly = false;
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

  // processes submission date change event called when the user changes date for assignment submissio
  submissionDateChange($event: MatDatepickerInputEvent<Date>) {
    
    this.submissionEnds.setValue($event.value);
    }
    

  private get submissionEnds(): FormControl {

    return this.assignmentForm?.get('submissionEnds') as FormControl;
  }

  private invalidForm(): boolean {

    return (this.name.invalid || this.type.invalid || this.subject.invalid
      || this.category.invalid || this.institution.invalid || this.totalQuestion.invalid
      || this.allocatedMark.invalid || this.submissionEnds.invalid)

  }

  postAssignment() {



    let assignmentDetails: AssignmentDetails = {
      id:0,
      name: this.name.value,
      type: this.selectedPdfType ? `pdf_${this.selectedPdfType}` : this.type.value,
      admin: this.currentUser!.id,
      subject: this.subject.value,
      category: this.category.value,
      institution: this.institution.value.id,
      allocatedMark: this.allocatedMark.value,
      totalQuestions: this.totalQuestion.value,
      creationDate: this.assignmentForm!.get('creationDate')!.value,
      submissionEnds: this.submissionEnds.value,

    }

    this.submitBtn.disabled = true;
   
    switch ((this.type.value as string).toLowerCase()) {
      case 'pdf':

        if (this.fileToUpload) {

         

          assignmentDetails.pdfFiles = [];
          assignmentDetails.pdfFiles.push(this.fileToUpload);

          this.assignmentService.postPDFAssignment(this.prepareFormData(assignmentDetails)).subscribe({
            next:(val:number) =>{console.log(val)},
            error:(err) => console.log(err),
            complete:() => this.assignmentForm?.reset()
          })
        }

        break;

      default:

     
     
      assignmentDetails.assignmentResourceDTO = [];

    

      assignmentDetails.assignmentResourceDTO.push(...this.assignment.value);

      assignmentDetails.assignmentResourceDTO.forEach((resourceDto, index) => {

        resourceDto.options = this.transformToArrayOfOptions(index)
      })

     

      
        this.assignmentService.postAssignment(assignmentDetails).pipe(take(1)).subscribe({
          next:(val) => console.log(val),

          error:(err) => console.log(err),

          complete:() => this.assignmentForm?.reset()
        });
        break;
    }



  }

  // converts the options from the format [{A:'opion1',B:'option2'}] to the format [{'A:opion1','B:option2'}], compatible with the server's options object
  private transformToArrayOfOptions(index:number): string[]{

   let stringArrayOptions:string[] = [];

   Object.entries((this.assignment.at(index).get('options') as FormGroup).controls).forEach(([key, control]) => {

    stringArrayOptions.push(`${key}:${control.value}`)
   })
  
   return stringArrayOptions;
  }

  prepareFormData(details: AssignmentDetails): FormData {

    const formData = new FormData();
    formData.append('details',
      new Blob([JSON.stringify(details)], { type: 'application/json' }));

    for (let index = 0; index < details.pdfFiles!.length; index++) {
      formData.append('pdf', details.pdfFiles![index])

    }

    return formData;

  }


   // get the object of logged in user
   private _currentUser(){

    this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user =>{

      if(user){

        this.currentUser = user;
        this.getRegisteredInstitutions(user.id)
      }
    })
    }


  }





  
