import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { AppConfig } from 'app/config/service.config';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Promo } from './floating-banner.types';
import { PlatformLocation } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class FloatingBannerService
{
    private _promoBig: ReplaySubject<Promo> = new ReplaySubject<Promo>(1);
    private _promoSmall: ReplaySubject<Promo> = new ReplaySubject<Promo>(1);
    smallPromo: { bannerUrl: string; redirectUrl: string; };

    /**
     * Constructor
     */
    constructor(
        private _apiServer: AppConfig,
        private _router: Router,
        private _platformLocation: PlatformLocation,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for promo big
     *
     * @param value
     */
    set promoBig(value: Promo)
    {
        // Store the value
        this._promoBig.next(value);
    }

    /**
     * Getter for promo big
     */
    get promoBig$(): Observable<Promo>
    {
        return this._promoBig.asObservable();
    }

    /**
     * Setter for promo small
     *
     * @param value
     */
    set promoSmall(value: Promo)
    {        
        // Store the value
        this._promoSmall.next(value);
    }

    /**
     * Getter for promo small
     */
    get promoSmall$(): Observable<Promo>
    {
        return this._promoSmall.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Set big promo banner
    */
    setBigBanner(bannerUrl: string = null, redirectUrl: string = null): void
    {

        const promo = {
            bannerUrl: bannerUrl,
            redirectUrl: redirectUrl
        };

        this._promoBig.next(promo);

    }

    /**
     * Close big banner
     */
    closeBigBanner(): void
    {
        this._promoBig.next(null);
        // Close big then show the small banner
        this._promoSmall.next(this.smallPromo);
    }

    /**
    * Set small promo banner
    */
    setSmallBanner(bannerUrl: string = null, redirectUrl: string = null): void
    {
        
        // Initialize the object for small banner first
        this.smallPromo = {
            bannerUrl: bannerUrl,
            redirectUrl: redirectUrl
        };        
    }

    /**
     * Close big banner
     */
    closeSmallBanner(): void
    {
        this._promoSmall.next(null);
    }

    /**
     * Set floating banners
     * 
     * @param cartId 
     * @param storeId 
     */
    setBanners(cartId: string, storeId: string) {

        let fullUrl = (this._platformLocation as any).location.origin;
        let sanatiseUrl = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL
        let redirectUrl = 'https://' + this._apiServer.settings.marketplaceDomain + '/sign-up' +
                '?redirectURL=' + encodeURI('https://' + sanatiseUrl  + this._router.url) + '&guestCartId=' + cartId + '&storeId=' + storeId;

        this.setSmallBanner('assets/gif/SignUp_Now_Button_Click_GIF.gif', redirectUrl);
        this.setBigBanner('assets/promo/Sign-Up-PopUp-Banner_400x500.png', redirectUrl);
    }

}
