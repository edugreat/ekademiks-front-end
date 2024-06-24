import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private http:HttpClient) { }

  private signUpUrl = 'http://localhost:8080/auth/sign-up';
  
  //registers a new user
  registerUser(newUser:NewUser):Observable<number>{

    return this.http.post<number>(`${this.signUpUrl}`, newUser);




  }
}


//An object of a new user for sign up purpose
export class NewUser{

  id:number;
 
  constructor(

   
    private firstName: string,
    private lastName: string,
    private email:string,
    private password: string,
    private mobileNumber?: string,
    

  ){
    this.id = 0;
  }
 
  

  public get _firstName(): string {
    return this.firstName;
  }
 
  public get _lastName(): string {
    return this.lastName;
  }
 
  public get _email():string{

    return this.email;
  }

  public get _password(): string {
    return this.password;
  }
 

  public get _mobileNumber(): string|undefined {
    return this.mobileNumber 
  }
  

  public get _id(): number {
    return this.id;
  }
 
  
}