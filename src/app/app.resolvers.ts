import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, take, map, tap, catchError, filter } from 'rxjs/operators';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { UserService } from 'app/core/user/user.service';
import { StoresService } from './core/store/store.service';
import { PlatformLocation } from '@angular/common';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { NotificationService } from './core/notification/notification.service';

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _messagesService: MessagesService,
        private _navigationService: NavigationService,
        private _notificationsService: NotificationsService,
        private _quickChatService: QuickChatService,
        private _shortcutsService: ShortcutsService,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._navigationService.get(),
            this._messagesService.getAll(),
            this._notificationsService.getAll(),
            this._quickChatService.getChats(),
            this._shortcutsService.getAll(),
            this._userService.get()
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoreResolver implements Resolve<any>
{
    url = {
        full: null,
        domain: null,
        domainName: null,
        subDomainName: null,
    };

    cartId: string;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _cartService: CartService,
        private _platformLocation: PlatformLocation,
        private _router: Router
    )
    {

        // ----------------------
        // Get store by URL
        // ----------------------

        this.url.full = (this._platformLocation as any).location.origin;
        let sanatiseUrl = this.url.full.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        // check if the domain name valid for processing
        // if (sanatiseUrl.split('.').length > 3) {
        //     console.error("Invalid domain name: ", sanatiseUrl);
        //     this.url.domain = sanatiseUrl.split('.')[0] + ".symplified.ai"
        // } else {
            this.url.domain = sanatiseUrl;
            this.url.domainName = sanatiseUrl.split('.').at(-1); 
            this.url.subDomainName = sanatiseUrl.split('.')[0];
            
            // hardcord localhost to cinema-online (for now)
            if (this.url.subDomainName.indexOf("localhost") > -1) {
                this.url.domain = "cinema-online.symplified.ai"
            } else if (this.url.domain.split('.').at(-1) === "test") {
                // check for local development
                this.url.domain = this.url.domain.split('.')[0] + ".dev-my.symplified.ai";
            }
        // }

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {     
        return this._storesService.getStoreByDomainName(this.url.domain).pipe(
            take(1),
            switchMap(() => {
                // check if store id exists
                if (this._storesService.storeId$ && this._storesService.storeId$ !== null) {

                    // -----------------------
                    // check if cart id exists
                    // -----------------------

                    if (this._cartService.cartId$) {
                        
                        this.cartId = this._cartService.cartId$;
                        if(this.cartId && this.cartId !== '') {                            
                            this.getCartItems(this.cartId);
                        }
                        
                    } else {

                        let createCartBody = {
                            customerId: null, // later make a getter to get logged in user
                            storeId: this._storesService.storeId$,
                        }
                        this._cartService.createCart(createCartBody)
                        .subscribe((cart: Cart)=>{
                                // set cart id
                                this.cartId = cart.id;

                                if(this.cartId && this.cartId !== '') {
                                    this.getCartItems(this.cartId);
                                }
                            });
                    }

                    // -----------------------
                    // Get Store Snooze
                    // -----------------------
                    
                    this._storesService.getStoreSnooze()
                        .subscribe(() => {
                             
                        });

                } else if (this.url.subDomainName === "symplified" && state.url.indexOf("/payment-redirect") > -1) {
                    // redirecting
                } else {
                    // this._router.navigate(['home']);
                    // alert("no store id");
                    console.error("No store found");
                }

                return of(true);
            })
        );
    }

    getCartItems(cartId: string){        
        if (cartId) {
            this._cartService.getCartItems(cartId)
                .subscribe((response)=>{
                });
        }
    }
}