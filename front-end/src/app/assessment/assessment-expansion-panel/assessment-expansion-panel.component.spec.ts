import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel.component';

describe('AssessmentExpansionPanelComponent', () => {
  let component: AssessmentExpansionPanelComponent;
  let fixture: ComponentFixture<AssessmentExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AssessmentExpansionPanelComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(AssessmentExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
