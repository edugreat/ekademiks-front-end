import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadSubjectComponent } from './upload-subject.component';


describe('UploadSubjectComponent', () => {
  let component: UploadSubjectComponent;
  let fixture: ComponentFixture<UploadSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadSubjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
