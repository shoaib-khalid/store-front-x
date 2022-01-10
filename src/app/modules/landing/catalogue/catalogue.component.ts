import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { Product, ProductPagination } from 'app/core/product/product.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, switchMap, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { merge, Observable, Subject } from 'rxjs';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

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
    encapsulation: ViewEncapsulation.None
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

    searchInputControl: FormControl = new FormControl();
    categoryFilterControl: FormControl = new FormControl();

    filterControl: FormControl = new FormControl();
    sortName: 'asc' | 'desc' | '' = 'asc';
    searchName: string = "";

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;

    quantity: number = 0;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _cartService: CartService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        // Get the store info
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;
            });

        // Get the store categories
        this._storesService.storeCategories$
            .subscribe((response: StoreCategory[]) => {
                this.storeCategories = response;
            });

        this.catalogueSlug = this._route.snapshot.paramMap.get('catalogue-slug');

        // Get the store slug name in url path
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.catalogueSlug = this._route.snapshot.paramMap.get('catalogue-slug');
            

            let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
            this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
            
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    

        // Get the products
        this._productsService.products$
            .subscribe((response: Product[]) => {
                this.products = response;
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
            .subscribe((cart: Cart)=>{
                console.log("cart", cart)
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
}
