import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { switchMap, take, map, tap, catchError, filter } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { takeUntil } from 'rxjs/operators';
import { LogService } from 'app/core/logging/log.service';
import { FormControl } from '@angular/forms';
import { PlatformLocation } from '@angular/common';
import { Platform } from './platform.types';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PlatformService
{
    private _platform: BehaviorSubject<Platform | null> = new BehaviorSubject(null);
    private _platforms: BehaviorSubject<Platform[] | null> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public platformControl: FormControl = new FormControl();

    private url = {
        full: null,
        domain: null,
        domainName: null,
        subDomainName: null,
    };

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _platformLocation: PlatformLocation,
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for store
     *
    */
    get platform$(): Observable<Platform>
    {
        return this._platform.asObservable();
    }

    /**
     * Setter for store
     *
     * @param value
     */
    set platform(value: Platform)
    {
        // Store the value
        this._platform.next(value);
    }

    /**
     * Getter for stores
     *
    */
    get platforms$(): Observable<Platform[]>
    {
        return this._platforms.asObservable();
    }
    
    /**
     * Setter for stores
     *
     * @param value
     */
    set platforms(value: Platform[])
    {
        // Store the value
        this._platforms.next(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Set current platform
    */
    set(): Observable<any>
    {        
        // ----------------------
        // Get store by URL
        // ----------------------

        let fullUrl = (this._platformLocation as any).location.origin;
        this.url.full = fullUrl;

        let sanatiseUrl = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL
        this.url.domain = sanatiseUrl;

        let domainNameArr = sanatiseUrl.split('.');
        domainNameArr.shift();

        this.url.domainName = domainNameArr.join("."); 
        
        let subDomainName = sanatiseUrl.split('.')[0];
        this.url.subDomainName = subDomainName;
        
        return this._platform.pipe(
            take(1),
            map((platform) => {

                let platformSlug;
                let platformId;
                let platformName;
                let platformLogo;
                let platformLogoDark;
                let platformUrl = this.url.domain;
                let platformType;
                if (this.url.domain === 'customer.symplified.it') {
                    // Staging Symplified
                    platformId = "symplified";
                    platformName = "SYMplified.biz";
                    platformSlug = "symplified-staging";
                    platformLogo = "logo_symplified_bg-removebg.png";
                    platformLogoDark = "logo_symplified_bg-removebg.png";
                    platformType = "marketplace";
                } else if (this.url.domain === 'customer.symplified.biz') {
                    // Production Symplified
                    platformId = "symplified";
                    platformName = "SYMplified.biz";
                    platformSlug = "symplified-production";
                    platformLogo = "logo_symplified_bg-removebg.png";
                    platformLogoDark = "logo_symplified_bg-removebg.png";
                    platformType = "marketplace";
                } else if (this.url.domain === 'customer.symplified.test') {
                    // Development Symplified
                    platformId = "symplified";
                    platformName = "SYMplified.biz";
                    platformSlug = "symplified-development";
                    platformLogo = "logo_symplified_bg-removebg.png";
                    platformLogoDark = "logo_symplified_bg-removebg.png";
                    platformUrl = "customer.symplified.it"; // staging url
                    platformType = "marketplace";
                } else if (this.url.domain === 'customer2.symplified.it') {
                    // Staging Easydukan
                    platformId = "easydukan";
                    platformName = "EasyDukan";
                    platformSlug = "easydukan-staging";
                    platformLogo = "logo_easydukan_bg-removebg.png";
                    platformLogoDark = "logo_easydukan_bg-removebg-dark.png";
                    platformType = "marketplace";
                } else if (this.url.domain === 'customer.easydukan.co') {
                    // Production Easydukan
                    platformId = "easydukan";
                    platformName = "EasyDukan";
                    platformSlug = "easydukan-production";
                    platformLogo = "logo_easydukan_bg-removebg.png";
                    platformLogoDark = "logo_easydukan_bg-removebg-dark.png";
                    platformType = "marketplace";
                } else if (this.url.domain === 'customer.easydukan.test') {
                    // Development Easydukan
                    platformId = "easydukan";
                    platformName = "EasyDukan";
                    platformSlug = "easydukan-development";
                    platformLogo = "logo_easydukan_bg-removebg.png";
                    platformLogoDark = "logo_easydukan_bg-removebg-dark.png";
                    platformUrl = "customer2.symplified.it"; // staging url
                    platformType = "marketplace";
                } else {
                    console.error("Unregistered domain name", this.url.domainName);
                    platformType = "storefront";
                }
                
                let newPlatform = {
                    id: platformId,
                    slug: platformSlug,
                    name: platformName,
                    logo: platformLogo,
                    logoDark: platformLogoDark,
                    url: platformUrl,
                    type: platformType
                };

                // set this
                this.platformControl.setValue(newPlatform);

                // Update the store
                this._platform.next(newPlatform);

                this._logging.debug("Response from PlatformsService (Set)", newPlatform);

                // Return the store
                return newPlatform;
            })
        );
    }

    /**
    * Get the current logged in store data
    */
    get(): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;   

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };
        
        return this._httpClient.get<any>(productService + '', header)
            .pipe(
                tap((response) => {
                    
                    this._logging.debug("Response from StoresService (Before Reconstruct)",response);

                    this._platforms.next(response["data"]);
                })
            );
    }

    getPlatformsById(id: string): Observable<any>
    {
        return this._platforms.pipe(
            take(1),
            map((platforms) => {

                // Find the store
                const platform = platforms.find(item => item.id === id) || null;

                // set this
                this.platformControl.setValue(platform);

                this._logging.debug("Response from PlatformsService (getPlatformsById)",platform);

                // Update the store
                this._platforms.next([platform]);

                // Return the store
                return platform;
            }),
            switchMap((platform) => {

                if ( !platform )
                {
                    return throwError('Could not found store with id of ' + id + '!');
                }

                return of(platform);
            })
        );
    }

    getPlatformById(id: string): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
        };
        
        return this._httpClient.get<any>(productService + '' + id , header)
        .pipe(
            map((response) => {
                this._logging.debug("Response from PlatformsService (getPlatformById)",response);
                this._platform.next(response["data"]);

                // set this
                this.platformControl.setValue(response["data"]);

                return response["data"];
            })
        )
    }

    post(storeBody: any): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                "clientId": this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid
            }
        };
        
        return this.platforms$.pipe(
            take(1),
            // switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
            switchMap(platforms => this._httpClient.post<any>(productService + '/stores', storeBody , header).pipe(
                map((response) => {

                    this._logging.debug("Response from PlatformsService (Create Platform)",response);

                    let newResponse = response["data"];

                    // Update the products with the new product
                    this._platforms.next([newResponse, ...platforms]);

                    // Return the new product
                    return response;
                })
            ))
        );
    }

    /**
     * Update the store
     *
     * @param store
     */
    update(id: string, body: any): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                "clientId": this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid
            }
        };
        
        return this.platforms$.pipe(
            take(1),
            switchMap(stores => this._httpClient.put<any>(productService + '' + id, body , header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (Edit Store)",response);

                    // Find the index of the updated product
                    const index = stores.findIndex(item => item.id === id);

                    // Update the product
                    stores[index] = { ...stores[index], ...response["data"]};

                    // Update the products
                    this._platforms.next(stores);

                    // Return the new product
                    return response["data"];
                }),
                switchMap(response => this.platform$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._platform.next(response);

                        // Return the updated product
                        return response;
                    })
                ))
            ))
            
        );
    }

    /**
     * Delete the store
     * 
     * @param storeId
     */

    delete(id: string): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                "clientId": this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid
            }
        };
        
        return this.platforms$.pipe(
            take(1),
            switchMap(platforms => this._httpClient.delete(productService + '' + id, header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (Delete Store)",response);

                    // Find the index of the deleted product
                    const index = platforms.findIndex(item => item.id === id);

                    // Delete the product
                    platforms.splice(index, 1);

                    // Update the products
                    this._platforms.next(platforms);

                    let isDeleted:boolean = false;
                    if (response["status"] === 200) {
                        isDeleted = true
                        
                        // set selected platform to null anyway
                        this.platformControl.setValue(null);
                    }


                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    getPlatformType(): string 
    {
        let domain = (this._platformLocation as any).location.origin.replace(/^(https?:|)\/\//, '').split(':')[0];
        if (domain === "cinema-online.test") {
            return "storefront";
        } else {
            return "marketplace"
        }
    }
}
