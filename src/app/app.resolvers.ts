import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
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
import { NotificationService } from 'app/core/notification/notification.service';
import { IpAddressService } from 'app/core/ip-address/ip-address.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { AuthService } from 'app/core/auth/auth.service';
import { AppConfig } from 'app/config/service.config';
import { PlatformService } from './core/platform/platform.service';
import { HttpStatService } from './mock-api/httpstat/httpstat.service';

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _jwtService: JwtService,
        private _authService: AuthService,
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
            this._userService.get(this._authService.jwtAccessToken ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : "" )
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
        private _apiServer: AppConfig,
        private _storesService: StoresService,
        private _cartService: CartService,
        private _platformLocation: PlatformLocation,
        private _authService: AuthService,
        private _jwtService: JwtService,
        private _navigationService: NavigationService,
        private _router: Router,
        private _httpstatService: HttpStatService,
        private _activatedRoute: ActivatedRoute,

    )
    {

        // ----------------------
        // Get store by URL
        // ----------------------

        this.url.full = (this._platformLocation as any).location.origin;
        let sanatiseUrl = this.url.full.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        this.url.domain = sanatiseUrl;

        let domainNameArr = sanatiseUrl.split('.');
        domainNameArr.shift();

        this.url.domainName = domainNameArr.join("."); 
        this.url.subDomainName = sanatiseUrl.split('.')[0];

        let isImpersonate = this._apiServer.settings.env.impersonate;
        
        // hardcord localhost to cinema-online (for now)
        if (isImpersonate === true) {
            // check for local development
            this.url.domain = this.url.domain.split('.')[0] + this._apiServer.settings.env.impersonateUrl;
        }
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
        return forkJoin([this._storesService.getStoreByDomainName(this.url.domain).pipe(
            take(1),
            switchMap(() => {
                // check if store id exists
                if (this._storesService.storeId$ && this._storesService.storeId$ !== null) {

                    // -----------------------
                    // Get Store Category
                    // -----------------------

                    this._storesService.getStoreCategories()
                        .subscribe(()=>{

                        });

                    // -----------------------
                    // check if cart id exists
                    // -----------------------

                    if (this._cartService.cartId$) {

                        if (this._activatedRoute.snapshot.queryParamMap.get('customerCartId')) {
                            this.cartId = this._activatedRoute.snapshot.queryParamMap.get('customerCartId')

                            console.log('customerCartId', this.cartId);
                            // set customer cart id to local storage
                            this._cartService.cartId = this.cartId;
                            // then get cart items
                            this.getCartItems(this.cartId);
                            
                        }
                        else {
                            this.cartId = this._cartService.cartId$;
                            if(this.cartId && this.cartId !== '') {                            
                                this.getCartItems(this.cartId);
                            }
                        }
                        
                    } else {

                        // if customerId null means guest
                        let customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

                        
                        if (customerId != null) {
                            this._cartService.getCarts(customerId, this._storesService.storeId$)
                                .subscribe(response => {

                                    if (response['content'].length) {
                                        const customerCartId = response['content'][0].id
                                        // set cart id
                                        this._cartService.cartId = customerCartId;
                                        if(customerCartId && customerCartId !== '') {
                                            this.getCartItems(customerCartId);
                                        }
                                    }
                                    else {
                                        
                                        const createCartBody = {
                                            customerId: customerId, 
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
                                })
                                
                            }
                        else {
                            const createCartBody = {
                                customerId: customerId, 
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
        ),
        this._navigationService.get(),
        // this._httpstatService.get(500)
        ]);
    }

    getCartItems(cartId: string){        
        if (cartId) {
            this._cartService.getCartItems(cartId)
                .subscribe((response)=>{
                });
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class MainDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _ipAddressService: IpAddressService,
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
            this._ipAddressService.getIPAddress(),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class PlatformSetupResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _platformsService: PlatformService
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
        return this._platformsService.set();
    }
}