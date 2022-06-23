import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { environment } from 'environments/environment';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Store, StoreAssets, StoreSnooze, StoreTiming } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { DatePipe, DOCUMENT, PlatformLocation } from '@angular/common';
import { AppConfig } from 'app/config/service.config';
import { FloatingBannerService } from 'app/core/floating-banner/floating-banner.service';
import { CartService } from 'app/core/cart/cart.service';
import { DisplayErrorService } from 'app/core/display-error/display-error.service';

@Component({
    selector     : 'fnb-01-layout',
    templateUrl  : './fnb-01.component.html',
    encapsulation: ViewEncapsulation.None
})
export class Fnb01LayoutComponent implements OnInit, OnDestroy
{
    platform: Platform;
    store: Store;
    user: User;

    displayError: {
        type: string,
        title: string;
        message: string;
    } = null;
    
    isScreenSmall: boolean;
    navigation: Navigation;

    headerTitle: string;
    displayUsername: string = '';

    message: string;
    daysArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    storeSnooze: StoreSnooze = null;
    show500: boolean = false;
    show400: boolean = false;
    errorMessage: string = '';

    floatingMessageData = {};

    public version: string = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _apiServer: AppConfig,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _navigationService: NavigationService,
        private _platformsService: PlatformService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _datePipe: DatePipe,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _displayErrorService: DisplayErrorService,
        private _platformLocation: PlatformLocation,
        private _floatingBannerService: FloatingBannerService,
        private _cartService: CartService,

    )
    {
        this.headerTitle = this.getHeaderTitle(this._activatedRoute.root); 
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.headerTitle = this.getHeaderTitle(this._activatedRoute.root);
        });

        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {                
                if (response) {
                    this.store = response;

                    this._displayErrorService.hide();

                    //This is to be passed to floating-message
                    // this.floatingMessageData = { storeId: this.store.id, url: this.sanatiseUrl };

                    this._storesService.storeSnooze$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((storeSnoozeResponse: StoreSnooze) => {
                            if (storeSnoozeResponse) {
                                this.storeSnooze = storeSnoozeResponse;
                                if (this.store && this.storeSnooze) {
                                    // check store timings
                                    this.checkStoreTiming(this.store.storeTiming, this.storeSnooze);
                                }
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });

                } else {
                    this._displayErrorService.show({
                        type: '4xx',
                        code: '404',
                        title: "Page Not Found!",
                        message: "The store you are looking for might have been removed, had its name changed or is temporarily unavailable."
                    });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                if (navigation) {
                    this.navigation = navigation;                

                    let navigationObjectIndex =  navigation.default.findIndex(item => item.id === 'product-categories');
                    this._storesService.storeCategories$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((categories: any) => {
                            if (categories) {
                                this.navigation.default[navigationObjectIndex].children = [
                                    {
                                        id: 'all-products',
                                        title: 'All Products',
                                        type: "basic",
                                        exactMatch: true,
                                        link : '/catalogue/all-products',
                                        function: ()=> this.reload(),
                                        
                                    }
                                ];
        
                                if (categories) {
                                    categories.forEach(category => {
                                        let categorySlug = this.getCategorySlug(category.name)
                                        this.navigation.default[navigationObjectIndex].children.push( 
                                            {
                                                id: categorySlug,
                                                title: category.name,
                                                type: "basic",
                                                exactMatch: true,
                                                link : '/catalogue/' + categorySlug,
                                                function: ()=> this.reload()
                                            } 
                                         ) 
                                    })
                                }
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                if (user) {
                    this.user = user;
                    this.displayUsername = this.textTruncate(user.username, 12);

                    // if the navigation already exist dont push a new one
                    let index = this.navigation.default.findIndex(item => (item.id === 'orders' ||  item.id === 'orders'));

                    if (this.user && index < 0) {                            
                        this.navigation.default.unshift(
                            {
                                id   : 'orders',
                                title: 'My Orders',
                                type : 'basic',
                                icon : 'heroicons_outline:shopping-cart',
                                externalLink: true,
                                link : 'https://' + this._apiServer.settings.marketplaceDomain + '/orders'
                            },
                            {
                                id   : 'vouchers',
                                title: 'My Vouchers',
                                type : 'basic',
                                icon : 'heroicons_outline:ticket',
                                externalLink: true,
                                link : 'https://' + this._apiServer.settings.marketplaceDomain + '/vouchers'
                            }
                        );
                    }
                }                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to show 400
        this._displayErrorService.errorMessage$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.displayError = response;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get Header Title
     *
     * @param route
     */
    getHeaderTitle(route: ActivatedRoute) : string
    {
        //If no routeConfig is avalailable we are on the root path
        let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.headerTitle : '';
        let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';     

        // If the route is dynamic route such as ':id', remove it
        const lastRoutePart = path.split('/').pop();
        const isDynamicRoute = lastRoutePart.startsWith(':');
        if(isDynamicRoute && !!route.snapshot && route.routeConfig.data.headerTitle) {
            const paramName = lastRoutePart.split(':')[1];
            path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
            label = route.snapshot.params[paramName];
        }

        // Only adding route with non-empty label
        const labelName: string =  label ? label : '';
  
        if (route.firstChild) {
            //If we are not on our current path yet,
            //there will be more children to look after, to build our breadcumb
            return this.getHeaderTitle(route.firstChild);
        }

        return labelName;
    }

    getCategorySlug(categoryName: string) {
        return categoryName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    textTruncate(str, length, ending?:any){
        if (length == null) {
            length = 100;
          }
          if (ending == null) {
            ending = '...';
          }
          if (str && str.length > length) {
            return str.substring(0, length - ending.length) + ending;
          } else {
            return str;
          }  
    }

    checkStoreTiming(storeTiming: StoreTiming[], storeSnooze: StoreSnooze): void
    {

        // the only thing that this function required is this.store.storeTiming

        let todayDate = new Date();
        let today = this.daysArray[todayDate.getDay()];

        // check if store closed for all days
        let isStoreCloseAllDay = storeTiming.map(item => item.isOff);        

        // --------------------
        // Check store timing
        // --------------------

        // isStoreCloseAllDay.includes(false) means that there's a day that the store is open
        // hence, we need to find the day that the store is open
        if (isStoreCloseAllDay.includes(false)) {
            storeTiming.forEach((item, index) => {
                if (item.day === today) {
                    // this mean store opened
                    if (item.isOff === false) {
                        let openTime = new Date();
                        openTime.setHours(Number(item.openTime.split(":")[0]), Number(item.openTime.split(":")[1]), 0);

                        let closeTime = new Date();
                        closeTime.setHours(Number(item.closeTime.split(":")[0]), Number(item.closeTime.split(":")[1]), 0);

                        if(todayDate >= openTime && todayDate < closeTime ) {
                            // this mean it's open today but it's already past store opening hour
                            // console.info("We are OPEN today!");

                            // --------------------
                            // Check store snooze
                            // --------------------

                            let snoozeEndTime = new Date(storeSnooze.snoozeEndTime);
                            let nextStoreOpeningTime: string = "";                            

                            if (storeSnooze.isSnooze === true) {
                                // console.info("Store is currently on snooze");

                                // check if snoozeEndTime exceed closeTime
                                if (snoozeEndTime > closeTime) {
                                    // console.info("Store snooze exceed closeTime");

                                    // ------------------------
                                    // Find next available day
                                    // ------------------------

                                    let dayBeforeArray = storeTiming.slice(0, index + 1);
                                    let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                                    
                                    let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);                                
                                    nextAvailableDay.forEach((object, iteration, array) => {
                                        // this mean store opened
                                        if (object.isOff === false) {
                                            let nextOpenTime = new Date();
                                            nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);

                                            let nextCloseTime = new Date();
                                            nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);

                                            if(todayDate >= nextOpenTime){
                                                let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                                // console.info("We will open " + nextOpen);
                                                this.message = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                                nextStoreOpeningTime = "Store will open " + nextOpen;
                                                array.length = iteration + 1;
                                            }
                                        } else {
                                            console.warn("Store currently snooze. Store close on " + object.day);
                                        }
                                    });

                                } else {
                                    // this works for safari & google crome
                                    let storeSnoozeEndTime = new Date(storeSnooze.snoozeEndTime.replace(/-/g, "/")).toISOString();
                                    
                                    nextStoreOpeningTime = "Store will open at " + this._datePipe.transform(storeSnoozeEndTime,'EEEE, h:mm a');
                                }                                

                                if (storeSnooze.snoozeReason && storeSnooze.snoozeReason !== null) {
                                    this.message = "Sorry for the inconvenience, Store is currently closed due to " + storeSnooze.snoozeReason + ". " + nextStoreOpeningTime;
                                } else {
                                    this.message = "Sorry for the inconvenience, Store is currently closed due to unexpected reason. " + nextStoreOpeningTime;
                                }
                            }
                            
                            // ---------------------
                            // check for break hour
                            // ---------------------
                            if ((item.breakStartTime && item.breakStartTime !== null) && (item.breakEndTime && item.breakEndTime !== null)) {
                                let breakStartTime = new Date();
                                breakStartTime.setHours(Number(item.breakStartTime.split(":")[0]), Number(item.breakStartTime.split(":")[1]), 0);
    
                                let breakEndTime = new Date();
                                breakEndTime.setHours(Number(item.breakEndTime.split(":")[0]), Number(item.breakEndTime.split(":")[1]), 0);

                                if(todayDate >= breakStartTime && todayDate < breakEndTime ) {
                                    // console.info("We are on BREAK! We will open at " + item.breakEndTime);
                                    this.message = "Sorry for the inconvenience, We are on break! We will open at " + item.breakEndTime;
                                }
                            }
                        } else if (todayDate < openTime) {
                            // this mean it's open today but it's before store opening hour (store not open yet)
                            this.message = "Sorry for the inconvenience, We are closed! We will open at " + item.openTime;
                        } else {

                            // console.info("We are CLOSED for the day!");

                            // ------------------------
                            // Find next available day
                            // ------------------------

                            let dayBeforeArray = storeTiming.slice(0, index + 1);
                            let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                            
                            let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);                                
                            nextAvailableDay.forEach((object, iteration, array) => {
                                
                                // this mean store opened
                                if (object.isOff === false) {
                                    let nextOpenTime = new Date();
                                    nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);

                                    let nextCloseTime = new Date();
                                    nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);

                                    if(todayDate >= nextOpenTime){
                                        let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                        // console.info("We will open " + nextOpen);
                                        this.message = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                        array.length = iteration + 1;
                                    }
                                } else {
                                    console.warn("Store close on " + object.day);
                                }
                            });
                        }
                    } else {

                        console.warn("We are CLOSED today");
                        
                        // ------------------------
                        // Find next available day
                        // ------------------------

                        let dayBeforeArray = storeTiming.slice(0, index + 1);
                        let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                        
                        let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);
            
                        nextAvailableDay.forEach((object, iteration, array) => {
                            // this mean store opened
                            if (object.isOff === false) {
                                
                                let nextOpenTime = new Date();                    
                                nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);
                                
                                let nextCloseTime = new Date();
                                nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);
                                  
                                if(todayDate >= nextOpenTime){
                                    let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                    // console.info("We will open " + nextOpen);
                                    this.message = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                    array.length = iteration + 1;
                                }
                            } else {
                                console.warn("Store close on this " + object.day);
                            }
                        });
                    }
                }
            });
        } else {
            // this indicate that store closed for all days
            this.message = "Sorry for the inconvenience, We are closed!";
        }
    }

    goToMarketplace() {
        // this._router.navigate(['/']);

        // Navigate to the external redirect url (temporary)
        const redirectURL = this.platform.name === "DeliverIn" ? "https://www.deliverin.my" : "https://www.easydukan.co";
        this._document.location.href = redirectURL;
    }

    goToHome() {
        
        // ----------------------
        // Get store by URL
        // ----------------------

        let fullUrl = (this._platformLocation as any).location.origin;
        let domain = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        let domainNameArr = domain.split('.'); domainNameArr.shift();
        let domainName = domainNameArr.join("."); 
        let subDomainName = domain.split('.')[0];
                
        if (subDomainName === "payment") {
            let homeUrl = "https://" + this.store.domain + "/home";
            this._document.location.href = homeUrl;
        } else {
            this._router.navigate(['/home']);
        }
    }

}
