import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  welcomeMsgUrl = 'http://localhost:8080/tests/welcome'

  constructor(private http: HttpClient) { }


  //fetches the welcome messages from the server
  getWelecomeMessages():Observable<string[]>{

    return this.http.get<string[]>(this.welcomeMsgUrl);
  }
}

