import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { AnalyticService } from './core/analytic/analytic.service';
import { StoresService } from './core/store/store.service';
import { Store } from './core/store/store.types';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IpAddressService } from './core/ip-address/ip-address.service';
import { CartService } from './core/cart/cart.service';
import { CookieService } from 'ngx-cookie-service'
import { AuthService } from './core/auth/auth.service';
import { JwtService } from './core/jwt/jwt.service';
import { UserService } from './core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { AppConfig } from './config/service.config';

declare let gtag: Function;

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})

export class AppComponent
{
    store      : Store = null;
    ipAddress  : string; 
    deviceInfo = null;

    ownerId: string;
    accessToken: string;
    refreshToken: string;

    favIcon16: HTMLLinkElement = document.querySelector('#appIcon16');
    favIcon32: HTMLLinkElement = document.querySelector('#appIcon32');

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _titleService: Title,
        private _storesService: StoresService,
        private _analyticService: AnalyticService,
        private _ipAddressService: IpAddressService,
        private _cartService: CartService,
        private _apiServer: AppConfig,
        private _authService: AuthService
    )
    {
    
    }

    ngOnInit() {

        console.log("navigator",navigator.userAgent);

        this._authService.signInUsingCookies()
            .subscribe((response)=>{});

        // Get User IP Address
        this._ipAddressService.ipAdressInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response:any)=>{
                if (response) {
                    this.ipAddress = response.ip_addr;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Get current store
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => { 
                if (response) {
                    this.store = response;
                    
                    // Set Title
                    this._titleService.setTitle(this.store.name);

                    let haveFaviconIndex = (this.store.storeAssets.length > 0) ? this.store.storeAssets.findIndex(item => item.assetType === "FaviconUrl" && item.id != null) : -1;

                    // Favicon from merchant
                    if (haveFaviconIndex > -1) {
                        
                        this.favIcon16.href = this.store.storeAssets[haveFaviconIndex].assetUrl;
                        this.favIcon32.href = this.store.storeAssets[haveFaviconIndex].assetUrl;
                    } else {
                        // Set Favicon
                        if(this.store.verticalCode === "FnB" || this.store.verticalCode === "E-Commerce") {
                            this.favIcon16.href = 'assets/branding/deliverin/favicon/favicon-16x16.png';
                            this.favIcon32.href = 'assets/branding/deliverin/favicon/favicon-32x32.png';
                        } else if (this.store.verticalCode === "FnB_PK" || this.store.verticalCode === "ECommerce_PK") {
                            this.favIcon16.href = 'assets/branding/easydukan/favicon/favicon-16x16.png';
                            this.favIcon32.href = 'assets/branding/easydukan/favicon/favicon-32x32.png';
                        } else {
                            this.favIcon16.href = 'favicon-16x16.png';
                            this.favIcon32.href = 'favicon-32x32.png';
                        }
                    }

                    // Set Google Analytic Code
                    if (this.store.googleAnalyticId) {

                        // Remove this later
                        // load google tag manager script
                        // const script = document.createElement('script');
                        // script.type = 'text/javascript';
                        // script.async = true;
                        // script.src = 'https://www.google-analytics.com/analytics.js';
                        // document.head.appendChild(script);   
                        
                        // register google tag manager
                        const script2 = document.createElement('script');
                        script2.async = true;
                        script2.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.store.googleAnalyticId;
                        document.head.appendChild(script2);

                        // load custom GA script
                        const gaScript = document.createElement('script');
                        gaScript.innerHTML = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag() { dataLayer.push(arguments); }
                        gtag('js', new Date());
                        gtag('config', '${this.store.googleAnalyticId}');
                        `;
                        document.head.appendChild(gaScript);

                        // GA for all pages
                        this._router.events.subscribe(event => {
                            if(event instanceof NavigationEnd){
                                // register google analytics            
                                gtag('config', this.store.googleAnalyticId, {'page_path': event.urlAfterRedirects});
                                
                            }
                        });
                    }

                    this._router.events.forEach((event) => {
            
                        //get ip address info
                        var _IpService = this.ipAddress;

                        //get domain
                        var domain = this._apiServer.settings.marketplaceDomain;
                        
                        //get session id by get cart id
                        var _sessionId = this._cartService.cartId$ 

                        const activityBody = 
                        {
                            browserType : null,
                            customerId  : this.ownerId?this.ownerId:null,
                            deviceModel : null,
                            errorOccur  : null,
                            errorType   : null,
                            ip          : _IpService,
                            os          : null,
                            pageVisited : 'https://' + domain + event["urlAfterRedirects"],
                            sessionId   : _sessionId,
                            storeId     : null
                        }
                        if(event instanceof RoutesRecognized) {
                            this._analyticService.postActivity(activityBody).subscribe((response) => {
                            });           
                        }
                        // NavigationEnd
                        // NavigationCancel
                        // NavigationError
                        // RoutesRecognized            
                    });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

}
