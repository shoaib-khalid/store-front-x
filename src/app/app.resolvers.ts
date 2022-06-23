import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { UserService } from 'app/core/user/user.service';
import { StoresService } from './core/store/store.service';
import { IpAddressService } from 'app/core/ip-address/ip-address.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { AuthService } from 'app/core/auth/auth.service';
import { PlatformService } from './core/platform/platform.service';
import { PlatformLocation } from '@angular/common';

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
            this._shortcutsService.getAll()
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoreResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _platformLocation: PlatformLocation,
        private _navigationService: NavigationService,
    )
    {
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
        
        // ----------------------
        // Get store by URL
        // ----------------------

        let fullUrl = (this._platformLocation as any).location.origin;
        let domain = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        let domainNameArr = domain.split('.'); domainNameArr.shift();
        let domainName = domainNameArr.join("."); 
        let subDomainName = domain.split('.')[0];

        let paramsArr = state.url.indexOf("?") > -1 ? state.url.split("?")[1].split("&").map(item=>{
            return {
                key :  item.split("=")[0],
                value :  item.split("=")[1]
            }
        }) : null;

        let storeIdIndex = paramsArr ? paramsArr.findIndex(item => item.key === "storeId") : -1;
        let cartIdIndex = paramsArr ? paramsArr.findIndex(item => item.key === "cartId") : -1;
        let storeId = storeIdIndex > -1 ? paramsArr[storeIdIndex].value : null;
        let cartId = cartIdIndex > -1 ? paramsArr[cartIdIndex].value : null;
         
        return forkJoin([
            (storeId && cartId && subDomainName === "payment") ? this._storesService.getStoreById(storeId, cartId) : this._storesService.getStoreByDomainName(),
            this._navigationService.get(),
            // this._httpstatService.get(418) // For Error Simulation
        ]);
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
        private _jwtService: JwtService,
        private _authService: AuthService,
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
            this._ipAddressService.getIPAddress(),
            this._userService.get(this._authService.jwtAccessToken ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : "" )
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