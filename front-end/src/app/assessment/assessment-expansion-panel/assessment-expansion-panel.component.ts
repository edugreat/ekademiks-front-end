import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentsService, TopicAndDuration } from '../assessments.service';
import { Observable, Subscription, tap } from 'rxjs';
import { AuthService, User } from '../../auth/auth.service';

@Component({
  selector: 'app-assessment-expansion-panel',
  templateUrl: './assessment-expansion-panel.component.html',
  styleUrl: './assessment-expansion-panel.component.css',
})
export class AssessmentExpansionPanelComponent implements OnInit, OnDestroy {



  constructor(private activatedRoute: ActivatedRoute,
    private assessmentService: AssessmentsService,
    private router: Router, private authService: AuthService) { }

  //subject topics on which the assessment is based
  topicsAndDurations$: Observable<TopicAndDuration[]> | undefined;
  subject = '';
  category = '';
  level = '';

  // instance of currently logged in user
  private currentUser?: User;

  private currentUserSub?: Subscription;



  ngOnInit(): void {
    this._currentUser();

  }

  ngOnDestroy(): void {

  }


  // get the object of logged in user
  private _currentUser() {

    if (this.authService.currentUser) {

      this.currentUser = this.authService.currentUser;

      this.getTopicAndDuration(this.currentUser.id)


      return;
    } else {


      if (!this.authService.currentUser && sessionStorage.getItem('cachingKey')) {


        const cacheKey = Number(sessionStorage.getItem('cachingKey'));
        this.currentUserSub = this.authService.cachedUser(cacheKey).pipe(tap((user) => this.getTopicAndDuration(user.id))).subscribe(user => this.currentUser = user);


      }
    }


  }





  // get the assessment topic and its duration
  private getTopicAndDuration(studentId: number) {

    this.subject = this.activatedRoute.snapshot.params['subject'];
    this.category = this.activatedRoute.snapshot.params['category'];
    // const studentId = this.studentId;

    if (this.subject && this.category) {

      if (!this.assessmentService.getSelectedTopicAndDuration(`${this.subject}_${this.category}`)) {



        this.topicsAndDurations$ = this.assessmentService.getTopicsAndDurations(this.subject, this.category, studentId);

        this.assessmentService.setTopicAndDuration(`${this.subject}_${this.category}`, this.topicsAndDurations$);
        // converts to lowercase case except the initial letter
        this.level = this.category.substring(0, 1) + '' + (this.category.substring(1)).toLowerCase()

      } else {


        this.topicsAndDurations$ = this.assessmentService.getSelectedTopicAndDuration(`${this.subject}_${this.category}`);
        this.level = this.category.substring(0, 1) + '' + (this.category.substring(1)).toLowerCase()
      }




    }



  }


  //Triggers the commencement of test
  commenceTest(topic: string, duration: number) {

    if (topic && this.level) {

      //routes to the TestComponent to fetch questions for the assessment
      this.router.navigate(['/start', topic, duration, this.subject, this.category]);
    }

  }
  goBack() {

    window.history.back()
  }

  // refreshes the page incase no data was fetched on previous attempt
  refreshData() {

    window.location.reload()
  }
}

