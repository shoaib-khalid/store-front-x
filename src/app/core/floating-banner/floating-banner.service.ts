import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Promo } from './floating-banner.types';

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
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _router: Router,
        private _logging: LogService
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

}
