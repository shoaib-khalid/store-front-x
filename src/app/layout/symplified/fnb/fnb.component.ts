import { ChangeDetectorRef, Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StoreCategory, StoreSnooze, StoreTiming } from 'app/core/store/store.types';
import { Subject, Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { NotificationService } from 'app/core/notification/notification.service';
import { DatePipe, DOCUMENT } from '@angular/common';
import { ProductsService } from 'app/core/product/product.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AppConfig } from 'app/config/service.config';
import { Platform } from 'app/core/platform/platform.types';
import { PlatformService } from 'app/core/platform/platform.service';

@Component({
    selector     : 'fnb-layout',
    templateUrl  : './fnb.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FnbLayoutComponent implements OnDestroy
{
    public version: string = environment.appVersion;
    
    platform: Platform;
    user: User;
    store: Store;
    storeCategories: StoreCategory[];
    storeCategory: StoreCategory;

    catalogueSlug: string;
    
    cartItem: CartItem[];
    cartItemQuantity: number = 0;

    storeSnooze: StoreSnooze = null;
    
    isHomePage: boolean = true;

    isLoading: boolean = false;

    // isHamburgerMenuOpen: boolean = false;

    currentSlider = {
        active  : null,
        previous: null,
        next    : null,
        current : 0,
        last    : 4
    };
    countDown: Subscription;
    counter:number = 1800;
    tick:number = 5000;
    
    notificationMessage: string;
    daysArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _storesService: StoresService,
        private _cartService: CartService,
        private _datePipe: DatePipe,
        private _notificationService: NotificationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _apiServer: AppConfig,
        private _platformService: PlatformService,
        private _productsService: ProductsService
    )
    {
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
    ngOnInit() {
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {
                this.store = response;

                this._storesService.storeSnooze$
                    .subscribe((response: StoreSnooze) => {
                        this.storeSnooze = response;
                        
                        if (this.store && this.storeSnooze) {
                            // check store timings
                            this.checkStoreTiming(this.store.storeTiming, this.storeSnooze);
                        }
        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User)=>{
                this.user = user;                
            });

        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform)=>{
                this.platform = platform;                
            });
            
            
        this._cartService.cartItems$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: CartItem[]) => {
                this.cartItem = response;

                // return array of quantity of each cartItem
                let _cartItemQttyArr: number[] = this.cartItem.map(item => {
                    return item.quantity;
                });

                // sum up the quantity in the array
                this.cartItemQuantity = _cartItemQttyArr.reduce((sum, a) => sum + a, 0);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // below used to decide which banner or header to be displayed
        this.isHomePage = this._router.url === "/home" ? true : false;
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.isHomePage = this._router.url === "/home" ? true : false;
        });

        // Get the store categories
        this._storesService.storeCategories$
            .subscribe((response: StoreCategory[]) => {

                
                this.storeCategories = response;

                if (this.storeCategories && this.storeCategories.length > 0) {
                    this.catalogueSlug = this.catalogueSlug ? this.catalogueSlug : this._activatedRoute.snapshot.paramMap.get('catalogue-slug');
                    
                    let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
                    this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
    
                    // set loading to true
                    this.isLoading = true;
                    
                    // this._productsService.getProducts(0, 12, "name", "asc", "", 'ACTIVE', this.storeCategory ? this.storeCategory.id : '')
                    //     .subscribe(()=>{
                    //         // set loading to false
                    //         this.isLoading = false;
                    //     });
                }
                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // this._notificationService.notification$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((response) => {
        //         this.notificationMessage = response;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

        // Slider
        // this.countDown = timer(0, this.tick)
        //     .subscribe(() => {
        //         if (this.currentSlider.current <= this.currentSlider.last) {
        //             this.currentSlider.active   = "translate-x-0";
        //             this.currentSlider.previous = "-translate-x-full",
        //             this.currentSlider.next     = "translate-x-full";
        //             this.currentSlider.current  = this.currentSlider.current + 1;
        //             if (this.currentSlider.current > this.currentSlider.last) {
        //                 this.currentSlider.active   = null;
        //                 this.currentSlider.previous = null,
        //                 this.currentSlider.next     = null;
        //                 this.currentSlider.current  = 0;
        //             }
        //         }
        //     });
        
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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

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
                                                this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
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
                                    this.notificationMessage = "Sorry for the inconvenience, Store is currently closed due to " + storeSnooze.snoozeReason + ". " + nextStoreOpeningTime;
                                } else {
                                    this.notificationMessage = "Sorry for the inconvenience, Store is currently closed due to unexpected reason. " + nextStoreOpeningTime;
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
                                    this.notificationMessage = "Sorry for the inconvenience, We are on break! We will open at " + item.breakEndTime;
                                }
                            }
                        } else if (todayDate < openTime) {
                            // this mean it's open today but it's before store opening hour (store not open yet)
                            this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open at " + item.openTime;
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
                                        this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
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
                                    this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
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
            this.notificationMessage = "Sorry for the inconvenience, We are closed!";
        }
    }
    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    showSlider(sliderNumber) {
        this.currentSlider.current = sliderNumber;
    }

    closeNotification(){
        this.notificationMessage = null;
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    getCategorySlug(categoryName: string) {
        return categoryName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    }

    changeCatalogue(value, event = null) {

        // find if categoty exists
        let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === value);
        // since all-product is not a real category, it will set to null
        this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
        // catalogue slug will be use in url
        this.catalogueSlug = value;
        
        this._router.navigate(['catalogue/' + value]);

        this.reload();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    customerLogin(){
        this._document.location.href = 'https://' + this._apiServer.settings.marketplaceDomain + 
            '?redirectUrl=' + encodeURI('https://' + this.platform.url);
    }

    customerLogout(){

    }
}
