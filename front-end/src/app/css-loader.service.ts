import { inject, Injectable, Renderer2, RendererFactory2 } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

// dynamically loads css stylesheets based on the user's device
export class CssLoaderService {

    private rendererFactory = inject(RendererFactory2);
    

    private renderer:Renderer2;

    private currentLinkedElement?:HTMLLinkElement;


    constructor(){

        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    public createCSSLink(userView:string):void{

        // remove previously linked stylesheet
        if(this.currentLinkedElement){

            this.renderer.removeChild(document.head, this.currentLinkedElement);
        }

        let cssFile:string;
       

     if(userView === 'xs' || userView === 'sm'){


        // create new link element
        cssFile = 'mobile-style.css';
        
        
     }else if(userView ==='md'){
        cssFile = 'tablet-style.css';
        
     }else {

        cssFile = 'desktop-style.css';
     }

     this.loadCSS(cssFile);
    }

    private loadCSS(cssFile:string){

        const linkEl = this.renderer.createElement('link');
        this.renderer.setAttribute(linkEl,'rel','stylesheet');
        this.renderer.setAttribute(linkEl, 'href', `assets/css/${cssFile}`)

        this.renderer.appendChild(document.head, linkEl);
        this.currentLinkedElement = linkEl;
    }
}