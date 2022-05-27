import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CustomerActivity } from './analytic.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IpAddressService } from '../ip-address/ip-address.service';
import { StoresService } from '../store/store.service';

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
        private _logging: LogService,
        private _deviceService: DeviceDetectorService,
        private _ipAddressService: IpAddressService,
        private _storeService: StoresService,


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
        //get storeId
        var _storeId = this._storeService.storeId$;

        //get device info (browser info, os info, device nodel infp)
        var device = this._deviceService.getDeviceInfo();
        let _deviceBrowser = device.browser + ' ' + device.browser_version
        let _deviceOs = device.os_version
        let _deviceModel = device.deviceType + ' ' + device.device

        bodyActivity["browserType"] = _deviceBrowser;
        bodyActivity["deviceModel"] = _deviceModel;
        bodyActivity["os"] = _deviceOs;
        bodyActivity["storeId"] = _storeId;

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