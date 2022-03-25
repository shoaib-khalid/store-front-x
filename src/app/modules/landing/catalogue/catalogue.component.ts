import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { Product, ProductInventory, ProductPagination } from 'app/core/product/product.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { map, switchMap, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { merge, Observable, Subject } from 'rxjs';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { CatalogueService } from './catalogue.service';

@Component({
    selector     : 'landing-catalogue',
    templateUrl  : './catalogue.component.html',
    styles       : [
        `
        /** Custom input number **/
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      
        .custom-number-input input:focus {
          outline: none !important;
        }
      
        .custom-number-input button:focus {
          outline: none !important;
        }

        /** Custom mat-checkbox theme **/

        body.light .mat-checkbox-disabled.mat-checkbox-checked .mat-checkbox-background {
            background-color: var(--fuse-primary);
        }
        
        body.light .mat-checkbox-disabled .mat-checkbox-label {
            color: black;
        }

        body.light .mat-checkbox-frame {
            border-color: var(--fuse-primary);
        }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    animations     : fuseAnimations,
})
export class LandingCatalogueComponent implements OnInit
{

    store: Store;
    storeCategories: StoreCategory[];
    storeCategory: StoreCategory;

    catalogueSlug: string;

    @ViewChild("productPaginator", {read: MatPaginator}) private _paginator: MatPaginator;
    // @ViewChild(MatSort) private _sort: MatSort;

    pagination: ProductPagination;
    products: Product[] = [];
    productName: string = null;

    oldPaginationIndex: number = 0;

    // product
    products$: Observable<Product[]>;
    selectedProduct: Product | null = null;

    productViewOrientation: string = 'grid';

    sortInputControl: FormControl = new FormControl();
    sortName: string = "name";
    sortOrder: 'asc' | 'desc' | '' = 'asc';

    searchInputControl: FormControl = new FormControl();
    searchName: string = "";

    collapseCategory: boolean = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;

    quantity: number = 0;

    pageOfItems: Array<any>;

    currentScreenSize: string[] = [];

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _cartService: CartService,
        private _catalogueService: CatalogueService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {
        this._matIconRegistry
            .addSvgIcon('search',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/search.svg'))
            .addSvgIcon('block-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/block-view.svg'))
            .addSvgIcon('list-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/list-view.svg'));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        
        // set loading to true
        this.isLoading = true;

        // Get the products
        this.products$ = this._productsService.products$;

        // Get the products pagination
        this._productsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductPagination) => {
                
                // Update the pagination
                this.pagination = pagination;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the store info
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {
                this.store = response;

                // Get the store categories
                this._storesService.storeCategories$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: StoreCategory[]) => {

                        if (response) {
                            this.storeCategories = response;
                        
                            this.catalogueSlug = this.catalogueSlug ? this.catalogueSlug : this._activatedRoute.snapshot.paramMap.get('catalogue-slug');
                            let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
                            this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
                         
                            // we'll get the previous url, any url split by / that have length more than 3 will considered product page
                            // after user click back from product page , we'll maintain it's previous pagination 
                            if (this._catalogueService.getPreviousUrl() && this._catalogueService.getPreviousUrl().split("/").length > 3) {                            
                                this.oldPaginationIndex = this.pagination ? this.pagination.page : 0;
                            }
    
                            this._productsService.getProducts(this.oldPaginationIndex, 12, "name", "asc", "", 'ACTIVE', this.storeCategory ? this.storeCategory.id : '')
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe(()=>{
                                    // set loading to false
                                    this.isLoading = false;

                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get cart
        this._cartService.cart$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cart: Cart)=>{
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {                    

                    this.searchName = query;
                    
                    // set loading to true
                    this.isLoading = true;
                    
                    return this._productsService.getProducts(0, 12, this.sortName, this.sortOrder, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '');
                }),
                map(() => {
                    // set loading to false
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.sortInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {

                    if (query === "recent") {
                        this.sortName = "created";
                        this.sortOrder = "desc";
                    } else if (query === "cheapest") {
                        this.sortName = "price";
                        this.sortOrder = "asc";
                    } else if (query === "expensive") {
                        this.sortName = "price";
                        this.sortOrder = "desc";
                    } else if (query === "a-z") {
                        this.sortName = "name";
                        this.sortOrder = "asc";
                    } else if (query === "z-a") {
                        this.sortName = "name";
                        this.sortOrder = "desc";
                    } else {
                        // default to recent (same as recent)
                        this.sortName = "created";
                        this.sortOrder = "desc";
                    }
                    
                    // set loading to true
                    this.isLoading = true;

                    return this._productsService.getProducts(0, 12, this.sortName, this.sortOrder, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '');
                }),
                map(() => {
                    // set loading to false
                    this.isLoading = false;
                })
            ).subscribe();

        // collapse category to false if desktop by default, 
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                this.currentScreenSize = matchingAliases;

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('sm') )
                {
                    this.collapseCategory = false;
                }
                else
                {
                    this.collapseCategory = true;
                    this.productViewOrientation = 'list';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });    

        
        // Mark for check
        this._changeDetectorRef.markForCheck();
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

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            // if (this._paginator )
            // {

            //     console.log("this._paginator", this._paginator);
                

            //     // Mark for check
            //     this._changeDetectorRef.markForCheck();

            //     // Get products if sort or page changes
            //     merge(this._paginator.page).pipe(
            //         switchMap(() => {
            //             this.isLoading = true;
            //             return this._productsService.getProducts(0, 12, this.sortName, this.sortOrder, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '');
            //         }),
            //         map(() => {
            //             this.isLoading = false;
            //         })
            //     ).subscribe();
            // }
        }, 0);
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // chooseCategory(id: string = null) {

    //     if (id){
    //         let index = this.storeCategories.findIndex(item => item.id === id);
    //         if (index > -1) {
    //             let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    //             this._router.navigate(['/catalogue/' + slug]);
    //         } else {
    //             console.error("Invalid category: Category not found");
    //         }
    //     } else {
    //         this._router.navigate(['/catalogue/all-products']);
    //     }

    // }

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

    decrement() {
        this.quantity --;
    }
    
    increment() {
        this.quantity ++;
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
            // set loading to true
            this.isLoading = true;

            this._productsService.getProducts(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.sortName, this.sortOrder, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '')
                .subscribe(()=>{
                    // set loading to false
                    this.isLoading = false;
                });
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    isProductOutOfStock(product: Product): boolean
    {
        if (product.allowOutOfStockPurchases === true) {
            return true;
        } else {
            if (product.productInventories.length > 0) {
                let productInventoryQuantities = product.productInventories.map(item => item.quantity);
                let totalProductInventoryQuantity = productInventoryQuantities.reduce((partialSum, a) => partialSum + a, 0);
    
                if (totalProductInventoryQuantity > 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    viewProduct(productSeo: string)
    {
        this._router.navigate(['catalogue/' + productSeo]);
    }

    /**
     * 
     * This function will return display see more based on height of 
     * div container
     * 
     * @param productDescription 
     * @returns 
     */
    displaySeeMore(productDescription){

        var div = document.createElement("div")
        div.innerHTML = productDescription
        div.style.width ="15rem";
        document.body.appendChild(div)

        if (div.offsetHeight > 130) {
            div.setAttribute("class","hidden")
            return true;
        } else {
            div.setAttribute("class","hidden")
            return false;
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
}
