import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { Endpoints } from '../end-point';
import { ChatCacheService } from '../chat/chat-cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  

  // an observable that emits an object of logged in users to subscribers
  private _loggedInUserSubject = new BehaviorSubject<User|undefined>(undefined);

  loggedInUserObs$ = this._loggedInUserSubject.asObservable();


  // This flag is used to stop anyother requests from proceeding while refresh token process is ongoing, until it completes
  private _refreshTokenInProcess = false;


  

  // Login event that is used at the app.compoent to trigger connection to the server's notification channel upon student's login ;
  private studentLoginSubject = new BehaviorSubject<boolean>(this.isLoggedInStudent);

  studentLoginObs$ = this.studentLoginSubject.asObservable();

  // an object of the currently logged in user
  private _currentUser?:User;

  // key-value pair of group ID and the date the user joined the group
  private _groupJoinDates = new Map<number, Date>;


  

  //A subject to emit the name of the currently logged in user (initially emits the generic placeholder 'Student'). Subscribers receive up to date information
  private currentUserName:BehaviorSubject<string> 

  //Get the observable version of the behabvior subject to ensure it only emits directly to this observable which subsequently notofies subscribers
  //The of this is to not allow subscribers directly subscribe to the Behavior subject so as not to emit unintended values by calling the subject's 'next' method upon subscription
  public userName$: Observable<string> ;
  constructor(private http: HttpClient, private endpoints:Endpoints, private chatCachedService:ChatCacheService) {

    this.currentUserName = new BehaviorSubject<string>(this.currentUser?.firstName || 'Student');
    this.userName$= this.currentUserName.asObservable();
    
   }
  

  //  set the current logged in user
   public set loggedInUser(loggedInUser:User | undefined){

    this._loggedInUserSubject.next(loggedInUser);

   }

   private set currentUser(user:User|undefined){

    this._currentUser = user;
   }

   public get currentUser(){

    return this._currentUser;
   }
  

   login(email:string, password:string, role:string):Observable<User>{

    
    return this.http.post<User>(`${this.endpoints.baseSignInUrl}?role=${role}`, {email:`${email}`, password:`${password}`}).pipe(
      tap(user =>{

        this.loggedInUser = user;

        this.currentUser = user;

       

         this.saveToSession(user)

      })
    )


  }


  // returned redis cached object of loggedin user from the server
  cachedUser(cacheKey:number):Observable<User> {

    return this.http.get<User>(`
      ${this.endpoints.cachedUserUrl}?cache=${cacheKey}`).pipe(tap((user) => {

        this.loggedInUser = user;
        this.currentUser = user;
        this.currentUserName.next(user.firstName)
        //this.saveToSession(user)
      
      }));

  
  }
  

  private set groupJoinDates(joinedDate:Map<number, Date>){

    this._groupJoinDates = new Map(Object.entries(joinedDate).map(([key, val])  => [Number(key), new Date(val)]));

    

    
  }

  public get groupJoinDates():Map<number, Date>{

    if(this._groupJoinDates.size) return this._groupJoinDates;

    else if(sessionStorage.getItem('joined')) {

      const date:Map<number, Date> = JSON.parse(sessionStorage.getItem('joined')!)

      this._groupJoinDates = new Map(Object.entries(date).map(([key, val])  => [Number(key), new Date(val)]));
    }

    return this._groupJoinDates;
  }

  // requests for new token when the existing token has expired
  requestNewToken():Observable<User>{

    const refreshToken = sessionStorage.getItem('refreshToken');

    return this.http.post<User>(`${this.endpoints.refreshTokenUrl}`, {'refreshToken':refreshToken}).pipe(
      tap((user) => {

       
        this.saveToSession(user)
      }),
    
    );
      

  }

  
 
  // observable of boolean value that checks if the current user belongs in any group chat
  public isGroupMember(studentId:number):Observable<boolean>{

    return this.http.get<boolean>(`${this.endpoints.isGroupMemberUrl}?id=${studentId}`);

  }
  //saves the just logged in user's token to the session storage
  private saveToSession(user:User){

  //  save indication that the user is not guest
    sessionStorage.setItem("logged", "yes");

    sessionStorage.setItem('cachingKey', user.cachingKey!);

    sessionStorage.setItem('accessToken', user.accessToken);
   
    // sets the refresh token once as it serves only for requesting new tokens
    if(!sessionStorage.getItem('refreshToken')){

      sessionStorage.setItem('refreshToken', user.refreshToken);
    }

    if(this.isLoggedInStudent){

      // confirm the student belongs in a chat group
      this.isGroupMember(user.id).pipe(take(1)).subscribe(member => {
        if(member === true){
          sessionStorage.setItem('inGroup','yes');

          // retrieve information about when they join the group chats
          this.updateGroupJoinedDates(user.id)
        }
      })
    }

    
  //   sessionStorage.setItem('username', user.firstName);
  //  sessionStorage.setItem('roles', JSON.stringify(user.roles));
    this.currentUserName.next(user.firstName);
    sessionStorage.setItem('status', user.status);
    if(this.isLoggedInStudent){
      this.studentLoginSubject.next(true);//send browser reload notification once a user successfully logs

    }

    if(this.isLoggedInStudent){

      sessionStorage.setItem('studentId', user.id+'');
    }else if(this.isAdmin()){

      sessionStorage.setItem('adminId',user.id+'')

    }

  
  }

  // special method that tests if the logged in user is a super admin
  isSuperAdmin(){

    const roles:string[] = (sessionStorage.getItem('roles') ? JSON.parse(sessionStorage.getItem('roles')!)  : []);

    return roles.some(role => role.toLowerCase() === 'superadmin');
  }

  
  private groupJoinedDates(studentId:number):Observable<Map<number, Date>>{

    
    return this.http.get<Map<number, Date>>(`${this.endpoints.grp_joined_at}?id=${studentId}`)

    
  }

  public get status(){

    return sessionStorage.getItem('status');
  }

  updateGroupJoinedDates(studentId:number){


    this.groupJoinedDates(studentId).pipe(take(1)).subscribe({
      next:(joinedDate) => {

       this.groupJoinDates = joinedDate;

       sessionStorage.setItem('joined',JSON.stringify(joinedDate));
      }
    })

  }

   

  //checks if the current user is a logged in user user
  get isLoggedIn():boolean{

    return sessionStorage.getItem("logged") !== null;
  }

  //logs the current user out by simply clearing their token from the session storage
 logout():void{
    //clears the user roles stored in memory once the user logs out
   sessionStorage.clear();

   this.loggedInUser = undefined
    this.chatCachedService.clearAllChats();
    this.currentUserName.next('Student');
    this.studentLoginSubject.next(false);
   
  }

  

  //checks if the current user is an admin
  isAdmin():boolean{
    const roles:string[] = (sessionStorage.getItem('roles') ? JSON.parse(sessionStorage.getItem('roles')!)  : [])
   
    return roles.some(role => role.toLowerCase() === 'admin' ||  roles.toLocaleString() === 'superadmin');

   
  }

  // Checks if the current user is a logged in student
   get isLoggedInStudent():boolean{

    if(this.currentUser) return this.currentUser.roles.some(role => role.toLowerCase() === 'student');
    

    return false;
  }
 
  get studentId():number{

    return Number(sessionStorage.getItem('studentId')!);
  }


  public get refreshTokenInProcess() {
    return this._refreshTokenInProcess;
  }
  
  public set refreshTokenInProcess(value) {
    this._refreshTokenInProcess = value;
  }
}

export interface User{

  id:number,
  firstName:string,
  lastName:string,
  mobileNumber: string,
  email:string,
  statusCode:number,
  cachingKey?:string, // used to look up redis cached object
  status:string //SENIOR or JUNIOR
  accessToken:string,
  refreshToken:string,
  signInErrorMessage:string,
  roles:string[],
  
}
