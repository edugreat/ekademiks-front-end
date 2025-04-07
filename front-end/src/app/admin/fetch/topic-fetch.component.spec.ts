import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicFetchComponent } from './topic-fetch.component';


describe('TopicFetchComponent', () => {
  let component: TopicFetchComponent;
  let fixture: ComponentFixture<TopicFetchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TopicFetchComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(TopicFetchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
