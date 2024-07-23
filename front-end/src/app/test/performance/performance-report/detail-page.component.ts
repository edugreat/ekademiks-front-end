import { Component, Input } from '@angular/core';
import { Details } from './performance-report.component';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrl: './detail-page.component.css'
})

//This component serves provides a details view of each of the assessments the student takes.
//When a student clicks on a particular question number when viewing the performance report, they'll be served with the details of that particular assesment.
export class DetailPageComponent {

 @Input() details?:Details;


}
