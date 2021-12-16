import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LandingHomeResolver implements Resolve<any>
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
        return this._storesService.getStoreCategories();
    }
}
