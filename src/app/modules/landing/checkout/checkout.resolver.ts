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
        return this._checkoutService.resolveCheckout();
    }
}