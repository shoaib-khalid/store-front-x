import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { CheckoutService } from './checkout.service';


@Injectable({
    providedIn: 'root'
})
export class CheckoutResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _checkoutService: CheckoutService

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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._checkoutService.getAvailableCustomerVoucher(true),
            this._checkoutService.getAvailableCustomerVoucher(false),
        ])
    }
}