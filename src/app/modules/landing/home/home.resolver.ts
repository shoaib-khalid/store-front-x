import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { forkJoin, Observable } from 'rxjs';

import { AcademyService } from 'app/modules/landing/academy/academy.service';
import { Course } from 'app/modules/landing/academy/academy.types';

// @Injectable({
//     providedIn: 'root'
// })
// export class LandingHomeResolver implements Resolve<any>
// {
//     /**
//      * Constructor
//      */
//     constructor(private _storesService: StoresService)
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
//             this._storesService.getStoreCategories(),
//             this._storesService.getStoreDiscounts(),
//         ]);
//     }
// }

@Injectable({
    providedIn: 'root'
})
export class AcademyCoursesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Course[]>
    {
        return this._academyService.getCourses();
    }
}
