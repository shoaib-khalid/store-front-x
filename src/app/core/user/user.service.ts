import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Client, Customer, User } from 'app/core/user/user.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { Address } from 'app/modules/landing/checkout/checkout.types';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _customer: BehaviorSubject<Customer | null> = new BehaviorSubject(null);
    private _client: BehaviorSubject<Client | null> = new BehaviorSubject(null);
    private _customerAddress: BehaviorSubject<Address | null> = new BehaviorSubject(null);
    private _customerAddresses: BehaviorSubject<Address[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _logging: LogService,
        private _jwt: JwtService,

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

    /**
    * Getter for address
    */
     get customerAddress$(): Observable<Address>
     {
         return this._customerAddress.asObservable();
     }
 
     get customerAddresses$(): Observable<Address[]>
     {
         return this._customerAddresses.asObservable();
     }
         

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(ownerId: string = ""): Observable<any>
    {        
        if (ownerId === "") {
            return of(null);
        }

        let userService = this._apiServer.settings.apiServer.userService;
        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };        

        return this._httpClient.get<any>(userService + "/customers/" + ownerId, header)
            .pipe(
                map((user) => {
                    this._logging.debug("Response from UserService (getCustomerById)",user);
                    this._user.next(user["data"]);

                    return user["data"];
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

    // -----------------------------------------------------------------------------------------------------
    //                                         Customer Address
    // -----------------------------------------------------------------------------------------------------

    getCustomerAddress (customerId: string) {
        let userService = this._apiServer.settings.apiServer.userService;
        // let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let accessToken = "accessToken";
        // let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(userService + '/customer/' + customerId + '/address', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from UserService (getCustomerAddress)",response);

                    this._customerAddresses.next(response["data"].content);

                    return response["data"].content;
                })
            );
    }

    getCustomerAddressById(addressId:string) : Observable<Address>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;
        
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
   
        };

        return this._httpClient.get<Address>(userService + '/customer/' + customerId + '/address/' + addressId, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from UserService (getAddressById)", response);

                    return response["data"];
                })
            );
        


    }

    postCustomerAddress(id: string, customerAddressBody) : Observable<Address>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        // let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.customerAddresses$.pipe(
            take(1),
            switchMap( addresses => this._httpClient.post<Address>(userService + '/customer/' + customerId + '/address', customerAddressBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from UserService (postCustomerAddress)", response);
                    
                    const updatedAddresses = addresses;

                    updatedAddresses.unshift(response["data"]);
                    
                    this._customerAddresses.next(updatedAddresses);

                    return response["data"];
                })
            ))
        );
    }

    /**
    * Update address
    *
    * @param id
    * @param address
    */
    updateCustomerAddress(addressId: string, body: Address): Observable<any>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        // let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;
        let accessToken = "accessToken";
        
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this.customerAddresses$.pipe(
            take(1),
            switchMap(addresses => this._httpClient.put<Address>(userService + '/customer/' + customerId + '/address/' +  addressId , body , header).pipe(
                map((updatedAddress) => {

                    this._logging.debug("Response from UserService (UpdateAddress)",updatedAddress);

                    // Find the index of the updated address
                    const index = addresses.findIndex(item => item.id === addressId);

                    // Update the addresses
                    addresses[index] = { ...addresses[index], ...updatedAddress["data"]};

                    // Update the addresses
                    this._customerAddresses.next(addresses);

                    // Return the updated address
                    return updatedAddress["data"];
                })
            ))
        );
    }

    deleteCustomerAddress(addressId:string)  : Observable<boolean> {

        let userService = this._apiServer.settings.apiServer.userService;
        // let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.customerAddresses$.pipe(
            take(1),
            switchMap(addresses => this._httpClient.delete(userService + '/customer/' + customerId + '/address/' + addressId, header)
            .pipe(
                map((status: number) => {

                    this._logging.debug("Response from UserService (deleteCustomerAddress)",status);

                    // Find the index of the deleted discount
                    const index = addresses.findIndex(item => item.id === addressId);

                    // Delete the discount
                    addresses.splice(index, 1);

                    // Update the discounts
                    this._customerAddresses.next(addresses);

                    let isDeleted:boolean = false;
                    if (status["status"] === 200) {
                        isDeleted = true
                    }

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}
