import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryUploadComponent } from './category.upload.component';



describe('CategoryComponent', () => {
  let component: CategoryUploadComponent;
  let fixture: ComponentFixture<CategoryUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CategoryUploadComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
