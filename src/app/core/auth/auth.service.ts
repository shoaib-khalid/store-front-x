import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { AppConfig } from 'app/config/service.config';
import { LogService } from '../logging/log.service';
import { JwtService } from '../jwt/jwt.service';
import { Client, Customer } from '../user/user.types';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;


    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _logging: LogService,
        private _jwt: JwtService,
        private _userService: UserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     */
    set refreshToken(token: string)
    {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string
    {
        return localStorage.getItem('refreshToken') ?? '';
    }

    get userService():string
    {
        return this._apiServer.settings.apiServer.userService;
    }

    get userServiceCustomer():string
    {
        //later chnage to customers
        // return this.userService+ '/customers/';
        return this.userService+ '/clients/';

    }

    get access(): string
    {
        return 'accessToken';
    }

    get httpHeaderOptions() {
        return {
          headers: new HttpHeaders().set("Authorization", `Bearer ${this.access}`),
        };
    }

    get storeId$(): string
    {
         return localStorage.getItem('storeId') ?? '';
    }
    

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
      
        return this._httpClient.get(this.userServiceCustomer + email + '/password_reset', this.httpHeaderOptions).pipe(
            switchMap(async (response: any) => {

                this._logging.debug("Response from UserService (password_reset)",response);
                
            })
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(id: string, code, body): Observable<any>
    {
        return this._httpClient.put(this.userServiceCustomer + id + '/password/' + code + '/reset' , body ,  this.httpHeaderOptions).pipe(
            switchMap(async (response: any) => {

                this._logging.debug("Response from UserService (password_reset_id)",response);
            })

        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(this.userServiceCustomer + 'authenticate', credentials, this.httpHeaderOptions).pipe(
            switchMap(async (response: any) => {

                this._logging.debug("Response from UserService (Customers Authenticate)",response);

                /**
                 * 
                 *  JWT
                 * 
                 */


                // Generate jwt manually since Kalsym User Service does not have JWT
                let jwtPayload = {
                    iat: Date.parse(response.data.session.created),
                    iss: 'Fuse',
                    exp: Date.parse(response.data.session.expiry),
                    role: response.data.role,
                    act: response.data.session.accessToken,
                    uid: response.data.session.ownerId
                }

                this._logging.debug("Generate JWT payload with Fuse", jwtPayload);


                /**
                 * 
                 *  USER SERVICE
                 * 
                 */


                var header: any = {
                    headers: new HttpHeaders().set("Authorization", `Bearer ${response.data.session.accessToken}`)
                };
                
                // this._genJwt.generate(jwtheader,jwtpayload,secret)
                let token = this._jwt.generate({ alg: "HS256", typ: "JWT"},jwtPayload,response.data.session.accessToken);

                // get user info
                let userData: any = await this._httpClient.get(this.userServiceCustomer + response.data.session.ownerId, header).toPromise();
                
                // LATER CHANGE THIS
                // =============CUSTOMER
                // let user : Customer = userData.data;
                // ========== CLIENT
                let user : Client = userData.data;


                this._userService.client = user;

                this._logging.debug("UserService Object (Generated by Fuse)",user);

                /**
                 * 
                 *  PROCESS
                 * 
                 */

                // Store the access token in the local storage
                this.accessToken = token;
                
                // Store the refresh token in the local storage
                this.refreshToken = response.data.session.refreshToken;
                
                // Set the authenticated flag to true
                this._authenticated = true;
                
                // Return a new observable with the response
                let newResponse = {
                    "accessToken": this.accessToken,
                    "tokenType": "bearer",
                    "user": user
                };

                this._logging.debug("JWT Object (Generated by Fuse)",newResponse);
                // return of(response); // original
                return of(newResponse);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
    
        return this._httpClient.post(this.userServiceCustomer + 'session/refresh',
            this.refreshToken
        ,this.httpHeaderOptions).pipe(
            catchError(() =>
                // Return false
                of(false)
            ),
            switchMap(async (response: any) => {

                this._logging.debug("Response from UserService (/clients/session/refresh)",response);

                /**
                 * 
                 *  JWT
                 * 
                 */


                // Generate jwt manually since Kalsym User Service does not have JWT
                let jwtPayload = {
                    iat: Date.parse(response.data.session.created),
                    iss: 'Fuse',
                    exp: Date.parse(response.data.session.expiry),
                    role: response.data.role,
                    act: response.data.session.accessToken,
                    uid: response.data.session.ownerId
                }

                this._logging.debug("JWT Object (Generated by Fuse)",jwtPayload);


                /**
                 * 
                 *  USER SERVICE
                 * 
                 */


                var header: any = {
                    headers: new HttpHeaders().set("Authorization", `Bearer ${response.data.session.accessToken}`)
                };
                
                // this._genJwt.generate(jwtheader,jwtpayload,secret)
                let token = this._jwt.generate({ alg: "HS256", typ: "JWT"},jwtPayload,response.data.session.accessToken);

                // get user info
                let userData: any = await this._httpClient.get(this.userServiceCustomer + response.data.session.ownerId, header).toPromise();
                                
                // Store the user on the user service
                // LATER CHANGE THIS
                // =============CUSTOMER
                // let user : Customer = userData.data;
                // ========== CLIENT
                let user : Client = userData.data;

                this._userService.client = user;

                this._logging.debug("UserService Object (Generated by Fuse)",user);

                /**
                 * 
                 *  PROCESS
                 * 
                 */

                // Store the access token in the local storage
                this.accessToken = token;

                // Store the refresh token in the local storage
                this.refreshToken = response.data.session.refreshToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param customer
     */
    signUp(customer: { name: string; email: string; password: string; username: string }): Observable<any>
    {
        const body = {
            "deactivated": true,
            "email": customer.email,
            "locked": true,
            "name": customer.name,
            "username":customer.username,
            "password": customer.password,
            "roleId": "CUSTOMER",
            "storeId":this.storeId$,
        };
        
        return this._httpClient.post(this.userServiceCustomer + 'register', body, this.httpHeaderOptions).pipe(
            map((response, error) => {
                this._logging.debug("Response from AuthService (signUp for customer)",response);

                return response;
            },
            catchError((error:HttpErrorResponse)=>{
                return of(error);
            })
            )
        );
    }
 

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
