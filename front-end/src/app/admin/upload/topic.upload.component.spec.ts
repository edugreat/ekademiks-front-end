import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicUploadComponent } from './topic.upload.component';



describe('TopicComponent', () => {
  let component: TopicUploadComponent;
  let fixture: ComponentFixture<TopicUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopicUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopicUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
