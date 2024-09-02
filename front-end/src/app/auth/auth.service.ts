import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/auth/sign-in';

  

  // Login event that is used at the app.compoent to trigger connection to the server's notification channel upon student's login ;
  private studentLoginSubject = new BehaviorSubject<boolean>(this.isLoggedInStudent());

  studentLoginObs$ = this.studentLoginSubject.asObservable();


  

  //A subject to emit the name of the currently logged in user (initially emits the generic placeholder 'Student'). Subscribers receive up to date information
  private currentUserName:BehaviorSubject<string> 

  //Get the observable version of the behabvior subject to ensure it only emits directly to this observable which subsequently notofies subscribers
  //The of this is to not allow subscribers directly subscribe to the Behavior subject so as not to emit unintended values by calling the subject's 'next' method upon subscription
  public userName$: Observable<string> ;
  constructor(private http: HttpClient, private router:Router) {

    this.currentUserName = new BehaviorSubject<string>(sessionStorage.getItem('username')! || 'Student');
    this.userName$= this.currentUserName.asObservable();
    
   }
  

   login(email:string, password:string, role:string):Observable<User>{

    
    return this.http.post<User>(`${this.baseUrl}?role=${role}`, {email:`${email}`, password:`${password}`}).pipe(
      tap(user => this.saveToSession(user))
    )


  }

  //saves the just logged in user's token to the session storage
  private saveToSession(user:User){
  
    sessionStorage.setItem("token", user.token);
    sessionStorage.setItem("studentId", `${user.id}`)
    sessionStorage.setItem('username', user.firstName);
   sessionStorage.setItem('roles', JSON.stringify(user.roles));
    this.currentUserName.next(sessionStorage.getItem('username')!);
    if(this.isLoggedInStudent()){
      this.studentLoginSubject.next(true);//send browser reload notification once a user successfully logs

    }
  }

  
  

   

  //checks if the current user is a logged in user user
  isLoggedIn():boolean{

    return sessionStorage.getItem("token") !== null;
  }

  //logs the current user out by simply clearing their token from the session storage
 logout():void{

    sessionStorage.clear();
    //clears the user roles stored in memory once the user logs out
   sessionStorage.clear();
    this.currentUserName.next('Student');
    this.studentLoginSubject.next(false);
   
  }

  //checks if the current user is an admin
  isAdmin():boolean{
    const roles:string[] = (sessionStorage.getItem('roles') ? JSON.parse(sessionStorage.getItem('roles')!)  : [])
   
    return roles.some(role => role.toLowerCase() === 'admin');

   
  }

  // Checks if the current user is a logged in student
   isLoggedInStudent():boolean{

    const roles:string[] = (sessionStorage.getItem('roles') ? JSON.parse(sessionStorage.getItem('roles')!)  : [])
   
    return roles.some(role => role.toLowerCase() === 'student');
  }
 
  get studentId():number{

    return Number(sessionStorage.getItem('studentId')!);
  }
}

export interface User{

  id:number,
  firstName:string,
  lastName:string,
  mobileNumber: string,
  email:string,
  statusCode:number,
  token:string,
  signInErrorMessage:string,
  roles:string[]
}
