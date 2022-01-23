import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService
{
    private _notification: ReplaySubject<any> = new ReplaySubject<any>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for notification
     */
    get notification$(): Observable<any>
    {
        return this._notification.asObservable();
    }

    /**
     * Setter for notification
     */
    set notification(value)
    {
        this._notification.next(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

}
