import { Component, Input } from '@angular/core';
import { Student } from '../../../admin.service';

@Component({
  selector: 'app-student-details-page',
  templateUrl: './student-details-page.component.html',
  styleUrl: './student-details-page.component.css'
})
export class StudentDetailsPageComponent {

  @Input()
  student?:Student;

}
