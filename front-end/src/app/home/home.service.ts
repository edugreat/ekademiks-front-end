import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  welcomeMsgUrl = 'http://localhost:8080/tests/welcome';

  private welcomeMessage:string[] = [];

  constructor(private http: HttpClient) { }


  //fetches the welcome messages from the server
  getWelecomeMessages():Observable<string[]>{

    if(this.welcomeMessage.length) return of(this.welcomeMessage);

    return this.http.get<string[]>(this.welcomeMsgUrl).pipe(tap(msg => this.welcomeMessage = msg));
  }
}

