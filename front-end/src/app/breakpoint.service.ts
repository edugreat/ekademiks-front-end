import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {

  private breakpoint = inject(BreakpointObserver);

  private breakpointSub = new Subject<string>();

  public breakpoint$ = this.breakpointSub.asObservable();

  constructor() {

    this.breakpoint.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {

      if(result.breakpoints[Breakpoints.XSmall]){

        this.breakpointSub.next(BreakPoint.XS);
      }else if(result.breakpoints[Breakpoints.Small]){

        this.breakpointSub.next(BreakPoint.SM);
      }else if(result.breakpoints[Breakpoints.Medium]){

        this.breakpointSub.next(BreakPoint.MD);
      }else if(result.breakpoints[Breakpoints.Large]){
          this.breakpointSub.next(BreakPoint.LG);
        }else{
          BreakPoint.LG
        }
      });
    }

   }

 enum BreakPoint  {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg'
}