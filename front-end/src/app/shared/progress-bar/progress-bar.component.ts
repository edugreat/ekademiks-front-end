import { Component, Input } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {

  @Input() barMode: ProgressBarMode ='buffer';

  @Input() barColor = 'primary';//progress bar color
  @Input() barBufferValue = 25; //progress bar buffer value

  @Input() value = 0; //if the mode is set to 'dterminate', then the value property is used to set progress instead of the bufferValue property
}
