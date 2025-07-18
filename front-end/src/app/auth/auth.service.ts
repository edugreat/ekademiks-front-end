import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { Endpoints } from '../end-point';
import { LogoutDetectorService } from '../logout-detector.service';
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

  // Subject that emits to subscribers a map object of key(group chat id) and value(dates the user joined the group)
  private groupJoinedDateSubject = new BehaviorSubject<Date>(new Date());

  private groupJoinDateOb$ = this.groupJoinedDateSubject.asObservable();
 
  //A subject to emit the name of the currently logged in user (initially emits the generic placeholder 'Student'). Subscribers receive up to date information
  private currentUserName:BehaviorSubject<string> 

  //Get the observable version of the behabvior subject to ensure it only emits directly to this observable which subsequently notofies subscribers
  //The of this is to not allow subscribers directly subscribe to the Behavior subject so as not to emit unintended values by calling the subject's 'next' method upon subscription
  public userName$: Observable<string> ;

  private http = inject(HttpClient);
  private endpoints = inject(Endpoints);
  private logoutDetectorService = inject(LogoutDetectorService);
  private injector = inject(Injector);
  



  constructor() {

    
    this.currentUserName = new BehaviorSubject<string>(this.currentUser?.firstName || 'Student');
    this.userName$= this.currentUserName.asObservable();

    effect(() => {

      if(this.logoutDetectorService.isLogoutDetected()){

        this.logoutDetectorService.abortControllers();
      }
    })

    
  
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
  cachedUser(cacheKey:string):Observable<User> {

    return this.http.get<User>(`
      ${this.endpoints.cachedUserUrl}?cache=${cacheKey}`).pipe(tap((user) => {

        if(!user){

          this.logout();

          

          return;
        }
     
        this.loggedInUser = user;
        this.currentUser = user;
        this.currentUserName.next(user.firstName)
        this.saveToSession(user)
      
      }));

  
  }
  

  private set groupJoinDates(joinedDate:Map<number, Date>){

    this._groupJoinDates = new Map(Object.entries(joinedDate).map(([key, val])  => [Number(key), new Date(val)]));

    
  }

  // returns into the Observale, the value for the given key(i.e the date the user joined the given group chat)
  public  getJoinDates(groupId:number){

    this.groupJoinedDateSubject.next(this._groupJoinDates.get(groupId) || new Date());

    return this.groupJoinDateOb$;
  
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

  
 
  //saves the just logged in user's token to the session storage
  private saveToSession(user:User){

  //  save indication that the user is not guest
    sessionStorage.setItem("logged", "yes");
    sessionStorage.setItem('cachingKey', String(user.id));

    sessionStorage.setItem('accessToken', user.accessToken);
   
    // sets the refresh token once as it serves only for requesting new tokens
    if(!sessionStorage.getItem('refreshToken')){

      sessionStorage.setItem('refreshToken', user.refreshToken);
    }

    if(this.isLoggedInStudent && this.currentUser?.isGroupMember){


 // retrieve information about when they join the group chats
    this.groupJoinedDates(user.id).pipe(take(1)).subscribe();
     
    }

   
    this.currentUserName.next(user.firstName);
    
    if(this.isLoggedInStudent){
      this.studentLoginSubject.next(true);//send browser reload notification once a user successfully logs

    }

  
  }

  // special method that tests if the logged in user is a super admin
  get isSuperAdmin(){

    return this.currentUser ? this.currentUser.roles.some(role  => role.toLowerCase() === 'superadmin') : false;

   
  }

  
  public groupJoinedDates(studentId:number):Observable<Map<number, Date>>{

    
    return this.http.get<Map<number, Date>>(`${this.endpoints.grp_joined_at}?id=${studentId}`).pipe(tap(joinedDates =>{

      this.groupJoinDates = joinedDates;

    }))

    
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
   
    this.currentUserName.next('Student');
    this.studentLoginSubject.next(false);
    
    this.injector.get(ChatCacheService).clearAllChats();

    // notifies subscribers that the user has logged out
    this.logoutDetectorService.isLogoutDetected.set(true);

    // setTimeout(() => {
    //   location.reload();
    // }, 1000);
   
  }

  

  //checks if the current user is an admin
  get isAdmin():boolean{


    return this.currentUser ?  this.currentUser.roles.some(role => role.toLowerCase() === 'admin') : false;


   
  }

  // Checks if the current user is a logged in student
   get isLoggedInStudent():boolean{

     return this.currentUser ?  this.currentUser.roles.some(role => role.toLowerCase() === 'student') : false
    
   
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
  status:string //SENIOR or JUNIOR
  accessToken:string,
  refreshToken:string,
  signInErrorMessage:string,
  isGroupMember:boolean,
  roles:string[],
  
}
