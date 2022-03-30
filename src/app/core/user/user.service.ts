import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Client, Customer, User } from 'app/core/user/user.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _customer: BehaviorSubject<Customer | null> = new BehaviorSubject(null);
    private _client: BehaviorSubject<Client | null> = new BehaviorSubject(null);

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
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

        /**
     * Setter & getter for user
     *
     * @param value
     */
        set customer(value: Customer)
        {
            // Store the value
            this._customer.next(value);
        }
    
        get customer$(): Observable<Customer>
        {
            return this._customer.asObservable();
        }

                /**
     * Setter & getter for user
     *
     * @param value
     */
    set client(value: Client)
    {
        // Store the value
        this._client.next(value);
    }

    get client$(): Observable<Client>
    {
        return this._client.asObservable();
    }
         

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(ownerId: string): Observable<any>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };        

        return this._httpClient.get<any>(userService + "/customers/" + ownerId, header)
            .pipe(
                tap((user) => {
                    this._logging.debug("Response from UserService (getCustomerById)",user);
                    this._user.next(user);
                })
            );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
