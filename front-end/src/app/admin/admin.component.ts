import { Component, OnInit } from '@angular/core';
import { MatMenuItem } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  //acivated route parameter
  parameter:string | null | undefined;

  //any of the actions the admin wants to perform
  action = '';


  constructor(private activatedRoute: ActivatedRoute, private router:Router){

  

  }

  ngOnInit(): void {
   
 this.activatedRoute.paramMap.subscribe(params => this.parameter = params.get('parameter'))
    
    
    
  }

  process(){

    //redirect admin to the particular page based upon the action they want to perform
  this.router.navigate([this.action], {relativeTo: this.activatedRoute})

  }
  
}
