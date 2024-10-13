import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-topic-fetch',
  templateUrl: './topic-fetch.component.html',
  styleUrl: './topic-fetch.component.css'
})
export class TopicFetchComponent implements OnInit {



// new value for the assessmen topic as a result of editing
  newValue:any;

  // Index of the assessment title about to be edited
  editableIndex:number|undefined = undefined;

  // shows editing actions
  editingMode = false;


  assessmentTopics?:AssessmentTopics;

  private updatedValue:UpdatedAssessmentTopic = {};




  constructor(private activatedRoute:ActivatedRoute, private adminService:AdminService, private router:Router){}


  ngOnInit(): void {

    this.activatedRoute.params.subscribe(() => {


      this.getAssessmentTopics();
    })
    


  }


private getAssessmentTopics(){

  this.adminService.assessmentTopics().subscribe({
    next:(topics:AssessmentTopics) => this.assessmentTopics = topics,
    
    
  })

}


editTopic(index: number, value: string) {
  
  this.editingMode = true;
  this.editableIndex = index;
  this.newValue = value;
  }
  

  cancelEditing() {

   this.editingMode = false;
   this.editableIndex = undefined;
   this.newValue = undefined;

    }
    saveChanges(keyIndex: number, valueIndex:number) {
    if(this.assessmentTopics){

// get the keys in the key-value object as an array of keys
      const keyArray = Object.keys(this.assessmentTopics);

      const currentKey = keyArray[keyIndex];
      // Locate and edit the value of the object

      const oldValue = this.assessmentTopics[currentKey][valueIndex];

      // instantiate the key-value of the updateValue to the oldValue-newValue
      this.updatedValue[oldValue] = this.newValue;


      this.assessmentTopics[currentKey].splice(valueIndex, 1, this.newValue);

     

      this.adminService.updateAssessementTopic(this.updatedValue, currentKey).subscribe({

       error:(err) => this.router.navigate(['/error', err.error]),
       complete:() =>{
        this.editingMode = false;
        this.newValue = undefined;
        window.location.reload();

       }
      })

      

     
    }

     
    }

    deleteTopic(category: string, topic: string) {

     this.adminService.deleteAssessmentTopic(category, topic).subscribe({

      error:(err) => this.router.navigate(['/error', err.error]),
      complete:() => window.location.reload()
     })
     
      }

      goBack() {
       
        window.history.back()
        }
}

// object of assessment topics received from the server
type AssessmentTopics = {
  [key:string]:Array<string>;
}

// object representing an updated assessment topic where key is the old value and value is the new value
type UpdatedAssessmentTopic = {

  [key:string]:string;
}


