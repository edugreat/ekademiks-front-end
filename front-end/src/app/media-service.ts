import { Injectable } from "@angular/core";
import { MediaChange, MediaObserver } from "@angular/flex-layout";
import { Observable, Subscription } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class MediaService {

    constructor(private mediaObserver: MediaObserver){}
    
    //subscribe to media changes
    public  mediaChanges(){
        
        return this.mediaObserver.asObservable();
        




    }
}
