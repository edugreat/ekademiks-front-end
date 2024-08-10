import { Component, Input, OnInit } from '@angular/core';
import { Option, Question, TestDTO } from './upload-test.component';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preview-test',
  templateUrl: './preview-test.component.html',
  styleUrl: './preview-test.component.css'
})
export class PreviewTestComponent implements OnInit {
  

  @Input() preview:TestDTO | undefined;

  testForm?:FormGroup;

  constructor(private fb:FormBuilder){}


  ngOnInit(): void {
  
  }

  private initializeForm(){

    this.testForm = this.fb.group({
    id: new FormControl<number | null>({value: this.preview!.id, disabled:true}),
    category: new FormControl<string | undefined>({value: this.preview!.category, disabled:true}),
    subjectName: new FormControl<string | undefined>({value:this.preview!.subjectName, disabled:true}),
    testName: new FormControl<string | undefined>({value:this.preview!.testName, disabled:true}),
    duration: new FormControl<number | undefined>({value:this.preview!.duration, disabled:true}),
    questions:this.fb.array([])
});



  }

  private populateQuestions(){

    const questionArray = this.testForm!.get('questions') as FormArray;

    this.preview?.questions.forEach(question)//for each of the question, call createQuestion, passing in the 'question' argument
  }


  private createQuestion(question: Question) :FormGroup{

    const questionGroup:FormGroup = this.fb.group({

      questionNumber: new FormControl<number|undefined>({value: question.questionNumber, disabled:true},{nonNullable:true, validators:Validators.required}),
      text: new FormControl<string | undefined> ({value:question.text, disabled:true},{nonNullable:true, validators:Validators.required}),
      answer: new FormControl<string|undefined>({value:question.answer, disabled:true},{nonNullable:true, validators:Validators.required}),

      options:this.fb.array([])
    })


    

    question.options.forEach(option => (questionGroup.get('options') as FormArray).push(this.createOptions(option)))


  }

  private createOptions(option:Option):FormGroup{

    return this.fb.group({
      text: new FormControl<string|undefined>({value:option.text, disabled:true},{nonNullable:true, validators:Validators.required}),
      letter: new FormControl<string|undefined>({value:option.letter, disabled:true},{nonNullable:true, validators:Validators.required})
    })
  }



}
