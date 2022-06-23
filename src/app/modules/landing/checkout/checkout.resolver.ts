import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CheckoutService } from './checkout.service';

@Injectable({
    providedIn: 'root'
})
export class CheckoutResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _checkoutService: CheckoutService)
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
        let paramsArr = state.url.indexOf("?") > -1 ? state.url.split("?")[1].split("&").map(item=>{
            return {
                key :  item.split("=")[0],
                value :  item.split("=")[1]
            }
        }) : null;

        let storeIdIndex = paramsArr ? paramsArr.findIndex(item => item.key === "storeId") : -1;
        let cartIdIndex = paramsArr ? paramsArr.findIndex(item => item.key === "cartId") : -1;
        let storeId = storeIdIndex > -1 ? paramsArr[storeIdIndex].value : null;
        let cartId = cartIdIndex > -1 ? paramsArr[cartIdIndex].value : null;

        return this._checkoutService.resolveCheckout(storeId, cartId);
    }
}