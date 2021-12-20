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

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _platformLocation: PlatformLocation
    )
    {
        this.url.full = (this._platformLocation as any).location.origin;
        let sanatiseUrl = this.url.full.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        // check if the domain name valid for processing
        if (sanatiseUrl.split('.').length > 3) {
            console.error("Invalid domain name: ", sanatiseUrl);
            this.url.domain = "cinema-online.symplified.ai"
        } else {
            this.url.domain = sanatiseUrl;
            this.url.domainName = sanatiseUrl.split('.').at(-1); 
            this.url.subDomainName = sanatiseUrl.split('.')[0];
            
            // hardcord localhost to cinema-online (for now)
            if (this.url.subDomainName.indexOf("localhost") > -1) {
                this.url.domain = "cinema-online.symplified.ai"
            } else if (this.url.domain.split('.').at(-1) === "test") {
                // check for local development
                this.url.domain = this.url.domain.split('.')[0] + ".deliverin.my";
            }

            // console.log(this.url);
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
        return this._storesService.getStoreByDomainName(this.url.domain);
    }
}

