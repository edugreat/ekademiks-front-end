import { ElementRef } from "@angular/core";
import { NumericDirective } from "./numeric.directive";


describe('NumericDirective', () => {
  it('should create an instance', () => {

    const mockElementRef = new ElementRef(null);
    const directive = new NumericDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
