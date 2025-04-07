import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectFetchComponent } from './subject-fetch.component';

describe('SubjectFetchComponent', () => {
  let component: SubjectFetchComponent;
  let fixture: ComponentFixture<SubjectFetchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SubjectFetchComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(SubjectFetchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
