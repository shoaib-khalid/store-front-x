import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { forkJoin, Observable } from 'rxjs';

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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._storesService.getStoreCategories(),
        ]);
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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._storesService.getStoreDiscounts(),
        ]);
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
    constructor(private _productsService: ProductsService)
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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._productsService.getProducts(),
        ]);
    }
}

// @Injectable({
//     providedIn: 'root'
// })
// export class CartItemsResolver implements Resolve<any>
// {
//     /**
//      * Constructor
//      */
//     constructor(
//         private _cartService: CartService
//     )
//     {
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Resolver
//      *
//      * @param route
//      * @param state
//      */

//     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
//     {
//         // Fork join multiple API endpoint calls to wait all of them to finish
//         return forkJoin([
//             this._cartService.getCartItems(this._cartService.cartId$),
//         ]);
//     }
// }