import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { Product, ProductPagination } from 'app/core/product/product.types';
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
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';

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

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // @ViewChild(MatSort) private _sort: MatSort;

    pagination: ProductPagination;
    products: Product[];
    productName: string = null;

    // product
    products$: Observable<Product[]>;
    selectedProduct: Product | null = null;

    productViewOrientation: string = 'grid';

    sortInputControl: FormControl = new FormControl();
    sortName: 'asc' | 'desc' | '' = 'asc';

    searchInputControl: FormControl = new FormControl();
    searchName: string = "";

    collapseCategory: boolean = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;

    quantity: number = 0;

    items = [];
    pageOfItems: Array<any>;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _cartService: CartService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry,
        private _pagination: PaginationModule,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {
        this._matIconRegistry
            .addSvgIcon('search',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/symplified/fnb/icons/search.svg'))
            .addSvgIcon('block-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/symplified/fnb/icons/block-view.svg'))
            .addSvgIcon('list-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/symplified/fnb/icons/list-view.svg'));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

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

        // get initial store category
        this.catalogueSlug = this._activatedRoute.snapshot.paramMap.get('catalogue-slug');

        // Get the store info
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;
            });

        // Get the store categories
        this._storesService.storeCategories$
            .subscribe((response: StoreCategory[]) => {
                this.storeCategories = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    
        // // Get the products
        this._productsService.products$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Product[]) => {
                this.products = response;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            })


        // Get the products pagination
        this._productsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductPagination) => {

                // Update the pagination
                this.pagination = pagination;

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
                    
                    this.isLoading = true;
                    
                    return this._productsService.getProducts(0, 10, 'name', this.sortName, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '');
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.sortInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {

                    this.sortName = query;
                    
                    this.isLoading = true;
                    
                    return this._productsService.getProducts(0, 10, 'name', this.sortName, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '');
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();

        // collapse category to false if desktop by default, 
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('sm') )
                {
                    this.collapseCategory = false;
                }
                else
                {
                    this.collapseCategory = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });    

        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            // if ( this._sort && this._paginator )
            if ( this._paginator )
            {
                // Set the initial sort
                // this._sort.sort({
                //     id          : 'startDate',
                //     start       : 'asc',
                //     disableClear: true
                // });

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // If the user changes the sort order...
                // this._sort.sortChange
                //     .pipe(takeUntil(this._unsubscribeAll))
                //     .subscribe(() => {
                //         // Reset back to the first page
                //         this._paginator.pageIndex = 0;
                //     });

                // Get discounts if sort or page changes
                // merge(this._sort.sortChange, this._paginator.page).pipe(
                //     switchMap(() => {
                //         this.isLoading = true;
                //         if (this.productName != null)
                //             return this._productsService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.productName, '');
                //         else    
                //             return this._productsService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, '', '');

                //     }),
                //     map(() => {
                //         this.isLoading = false;
                //     })
                // ).subscribe();
                merge(this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        if (this.productName != null)
                            return this._productsService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, "name", "asc", this.productName, 'ACTIVE');
                        else    
                            return this._productsService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, "name", "asc", '', 'ACTIVE');

                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    chooseCategory(id: string = null) {

        if (id){
            let index = this.storeCategories.findIndex(item => item.id === id);
            if (index > -1) {
                let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
                this._router.navigate(['/catalogue/' + slug]);
            } else {
                console.error("Invalid category: Category not found");
            }
        } else {
            this._router.navigate(['/catalogue/all-products']);
        }

    }

    getCategorySlug(categoryName: string) {
        return categoryName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    }

    changeCatalogue(event) {

        if (event.checked === false) {
            return;
        }

        this._router.navigate(['catalogue/' + event.source.value]);
        
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

        this._productsService.getProducts(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], 'name', this.sortName, this.searchName, "ACTIVE" , this.storeCategory ? this.storeCategory.id : '')
            .subscribe();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
