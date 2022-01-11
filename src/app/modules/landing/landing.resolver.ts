import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { forkJoin, Observable, of } from 'rxjs';

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
        return this._storesService.storeId$ ? this._productsService.getProducts() : of(true);
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
        return this._storesService.storeId$ ? this._cartService.getCartItems(this._cartService.cartId$) : of(true);
    }
}