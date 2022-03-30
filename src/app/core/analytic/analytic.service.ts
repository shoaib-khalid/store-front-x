import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CustomerActivity } from './analytic.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AnalyticService
{
    private _analytic: ReplaySubject<CustomerActivity> = new ReplaySubject<CustomerActivity>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _jwt: JwtService,
        private _logging: LogService

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for customer activity
     */
    get analytic$(): Observable<CustomerActivity>
    {
        return this._analytic.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all customer activity data
     */
    get(): Observable<CustomerActivity>
    {
        return this._httpClient.get<CustomerActivity>('api/common/analytic').pipe(
            tap((analytic) => {
                this._analytic.next(analytic);
            })
        );
    }

    /**
    * Create the cart
    *
    * @param cart
    */
    postActivity(bodyActivity: CustomerActivity): Observable<any>
    {
        let analyticService = this._apiServer.settings.apiServer.analyticService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.post<any>(analyticService + '/customeractivity', bodyActivity, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from AnalyticService (postActivity)",response);

                    // set cart
                    this._analytic.next(response);

                    return response["data"];
                })
            );
    }
}