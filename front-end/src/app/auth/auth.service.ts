import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'http://localhost:8080/auth/sign-in';

  jwtToken = ''; //token to be received from the database after successful authentication


  //A subject to emit the name of the currently logged in user (initially emits the generic placeholder 'Student'). Subscribers receive up to date information
  private currentUserName:BehaviorSubject<string> = new BehaviorSubject<string>('Student');

  //Get the observable version of the behabvior subject to ensure it only emits directly to this observable which subsequently notofies subscribers
  //The of this is to not allow subscribers directly subscribe to the Behavior subject so as not to emit unitended values by calling the subject's 'next' method upon subscription
  public userName$: Observable<string> = this.currentUserName.asObservable();
  constructor(private http: HttpClient) { }
  

  login(email:string, password:string):Observable<User>{

    
    return this.http.post<User>(this.baseUrl, {email:`${email}`, password:`${password}`}).pipe(
      tap(user => this.saveToSession(user.token))
    )


  }

  //saves the just logged in user's token to the session storage
  private saveToSession(token:string,){

    sessionStorage.setItem("token", token);
    
  }

  //checks if the current user is a logged in user user
  isLoggedIn():boolean{

    return sessionStorage.getItem("token") !== null;
  }

  //logs the current user out by simply clearing their token from the session storage
 logout():void{

    sessionStorage.clear();
  }

  //updates the logged in user's name
  //This method is to be called once the user successfully logs in
  updateUserName(name:string){

    this.currentUserName.next(name);
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
