import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionsBankComponent } from './options-bank.component';


describe('OptionsBankComponent', () => {
  let component: OptionsBankComponent;
  let fixture: ComponentFixture<OptionsBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OptionsBankComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(OptionsBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
