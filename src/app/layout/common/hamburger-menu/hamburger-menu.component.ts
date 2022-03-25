import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config';
// import { FuseTailwindService } from '@fuse/services/tailwind';
import { AppConfig, Scheme, Theme, Themes } from 'app/core/config/app.config';
import { Layout } from 'app/layout/layout.types';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';
import { ProductsService } from 'app/core/product/product.service';
import { CartItem } from 'app/core/cart/cart.types';
import { CartService } from 'app/core/cart/cart.service';

@Component({
    selector     : 'hamburger-menu',
    templateUrl  : './hamburger-menu.component.html',
    styles       : [
        `
            settings {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None
})
export class HamburgerMenuComponent implements OnInit, OnDestroy
{
    config: AppConfig;
    layout: Layout;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;

    store: Store;
    storeCategories: StoreCategory[];
    storeCategory: StoreCategory;

    catalogueSlug: string;
    isLoading: boolean = false;

    cartItem: CartItem[];
    cartItemQuantity: number = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        // private _fuseTailwindService: FuseTailwindService,
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _cartService: CartService,
        private _activatedRoute: ActivatedRoute

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        
        // // Get the themes
        // this._fuseTailwindService.tailwindConfig$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((config) => {
        //         this.themes = Object.entries(config.themes);
        //     });

        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AppConfig) => {

                // Store the config
                this.config = config;
            });

        // Get the store categories
        this._storesService.storeCategories$
        .subscribe((response: StoreCategory[]) => {

            
            this.storeCategories = response;
            
            this.catalogueSlug = this.catalogueSlug ? this.catalogueSlug : this._activatedRoute.snapshot.paramMap.get('catalogue-slug');
            
            let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
            this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
            
            this._productsService.getProducts(0, 10, "name", "asc", "", 'ACTIVE', this.storeCategory ? this.storeCategory.id : '')
                .subscribe();

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Get the store slug name in url path
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.catalogueSlug = this._activatedRoute.snapshot.paramMap.get('catalogue-slug');

            let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
            this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
    
            // Mark for check
            this._changeDetectorRef.markForCheck();
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
     * Set the layout on the config
     *
     * @param layout
     */
         setLayout(layout: string): void
         {
             // Clear the 'layout' query param to allow layout changes
             this._router.navigate([], {
                 queryParams        : {
                     layout: null
                 },
                 queryParamsHandling: 'merge'
             }).then(() => {
     
                 // Set the config
                 this._fuseConfigService.config = {layout};
             });
         }
     
         /**
          * Set the scheme on the config
          *
          * @param scheme
          */
         setScheme(scheme: Scheme): void
         {
             this._fuseConfigService.config = {scheme};
         }
     
         /**
          * Set the theme on the config
          *
          * @param theme
          */
         setTheme(theme: Theme): void
         {
             this._fuseConfigService.config = {theme};
         }

}
