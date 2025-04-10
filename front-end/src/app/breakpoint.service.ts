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


  public XS = 'xs';
  public SM = 'sm';
  public MD = 'md';
  public LG = 'lg';
  

  constructor() {

    this.breakpoint.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
    ]).subscribe(result => {

      if(result.breakpoints[Breakpoints.XSmall]){

        this.breakpointSub.next('xs');
      }else if(result.breakpoints[Breakpoints.Small]){

        this.breakpointSub.next('sm');
      }else if(result.breakpoints[Breakpoints.Medium]){

        this.breakpointSub.next('md');
      }else if(result.breakpoints[Breakpoints.Large]){
          this.breakpointSub.next('lg');
        }
      });
    }

   }

