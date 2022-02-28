import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { StoreCategory } from 'app/core/store/store.types';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StoreCategoriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _storesService: StoresService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._storesService.storeId$ ? this._storesService.getStoreCategories() : of(true);
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoreDiscountsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _storesService: StoresService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._storesService.storeId$ ? this._storesService.getStoreDiscounts() : of(true);
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProductsResolver implements Resolve<any>
{
    storeCategories: StoreCategory[];
    storeCategory: StoreCategory;

    /**
     * Constructor
     */
    constructor(
        private _productsService: ProductsService,
        private _storesService: StoresService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {

        if (this._storesService.storeId$) {
            // Get store categories data
            this._storesService.storeCategories$
                .subscribe((response) => {
                    if (response !== null) {
                        this.storeCategories = response;
    
                        let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === route["params"]["catalogue-slug"]);
                        this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
                    }
                });
        }
        
        return this._storesService.storeId$ ? this._productsService.getProducts(0, 12, 'name', 'asc', '', "ACTIVE" , this.storeCategory ? this.storeCategory.id : '') : of(true);
    }
}

@Injectable({
    providedIn: 'root'
})
export class CartItemsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _cartService: CartService,
        private _storesService: StoresService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return (this._storesService.storeId$ && this._cartService.cartId$) ? this._cartService.getCartItems(this._cartService.cartId$) : of(true);
    }
}