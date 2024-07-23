import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryFetchComponent } from './category-fetch.component';


describe('CategoryFetchComponent', () => {
  let component: CategoryFetchComponent;
  let fixture: ComponentFixture<CategoryFetchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryFetchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryFetchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
