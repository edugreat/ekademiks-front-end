import { Component, Input, OnInit } from '@angular/core';
import { Option, Question, TestDTO } from './upload-test.component';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preview-test',
  templateUrl: './preview-test.component.html',
  styleUrl: './preview-test.component.css'
})
export class PreviewTestComponent implements OnInit {

  

  // TestDTO input
  @Input() preview:TestDTO | undefined;

  testForm:FormGroup | undefined;

  constructor(private fb:FormBuilder){}


  ngOnInit(): void {

    this.initializeForm();
  
  }

  // Initializes dynamic form build from existing data
  private initializeForm(){

    this.testForm = this.fb.group({
    id: new FormControl<number | null>({value: this.preview!.id, disabled:true}),
    category: new FormControl<string | undefined>({value: this.preview!.category, disabled:true}),
    subjectName: new FormControl<string | undefined>({value:this.preview!.subjectName, disabled:true}),
    testName: new FormControl<string | undefined>({value:this.preview!.testName, disabled:true}),
    duration: new FormControl<number | undefined>({value:this.preview!.duration, disabled:true}),
    questions:this.fb.array([])
});

// Populate questions and their associated options here
this.populateQuestions();


  }

  private populateQuestions(){

   
    //for each of the question, call createQuestion, passing in the 'question' argument
    this.preview!.questions.forEach(question => (this.testForm!.get('questions') as FormArray).push(this.createQuestion(question)));
  }

// Create question form group
  private createQuestion(question: Question) :FormGroup{

    const questionGroup:FormGroup = this.fb.group({

      questionNumber: new FormControl<number|undefined>({value: question.questionNumber, disabled:true},{nonNullable:true, validators:Validators.required}),
      text: new FormControl<string | undefined> ({value:question.text, disabled:true},{nonNullable:true, validators:Validators.required}),
      answer: new FormControl<string|undefined>({value:question.answer, disabled:true},{nonNullable:true, validators:Validators.required}),

      options:this.fb.array([])
    });


    

    question.options.forEach(option => (questionGroup.get('options') as FormArray).push(this.createOptions(option)));

    return questionGroup;


  }

  // Create options form group
  private createOptions(option:Option):FormGroup{

    return this.fb.group({
      text: new FormControl<string|undefined>({value:option.text, disabled:true},{nonNullable:true, validators:Validators.required}),
      letter: new FormControl<string|undefined>({value:option.letter, disabled:true},{nonNullable:true, validators:Validators.required})
    })


  }


// returns the question form array
get questionsArray(): FormArray{


  return this.testForm!.get('questions') as FormArray;
}

// get options at a particular index of the form array
getOptionsArray(index:number):FormArray{

  return (this.questionsArray.at(index) as FormGroup).get('options') as FormArray;
}

// Uploads assessment
uploadNow() {
  
  console.log(JSON.stringify(this.testForm?.value, null, 3));

 
  }
}
