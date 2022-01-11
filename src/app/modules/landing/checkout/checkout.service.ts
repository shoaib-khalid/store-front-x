import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { StoresService } from 'app/core/store/store.service';
import { Customer } from 'app/core/user/user.types';
import { CartDiscount, DeliveryCharges, DeliveryProvider } from './checkout.types';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService
{
    // private _cart: ReplaySubject<Cart> = new ReplaySubject<Cart>(1);
    // private _cartItems: ReplaySubject<CartItem[]> = new ReplaySubject<CartItem[]>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _storeService: StoresService,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for saveMyInfo
     */
    set saveMyInfo(value: string) {
        localStorage.setItem('saveMyInfo', value);
    }

    /**
     * Getter for cartId
     */
    get saveMyInfo$(): string
    {
        return localStorage.getItem('saveMyInfo') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the Customer Info
     */
    getCustomerInfo(email: string = null, phoneNumber: string = null): Observable<Customer>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                email,
                phoneNumber
            }
        };

        if (header.params.email === null) delete header.params.email;
        if (header.params.phoneNumber === null) delete header.params.phoneNumber;

        return this._httpClient.get<any>(userService + '/stores/' + this._storeService.storeId$ + '/customers/', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getCustomerInfo)",response);

                    return response["data"].content[0];
                })
            );
    }

    postToRetrieveDeliveryCharges(deliveryCharges: DeliveryCharges) : Observable<DeliveryProvider[]>
    {
        let deliveryService = this._apiServer.settings.apiServer.deliveryService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.post<any>(deliveryService + '/orders/getprice', deliveryCharges, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postToRetrieveDeliveryCharges)",response);

                    return response["data"];
                })
            );
    }

    /**
     * Get Discount
     */
     getDiscountOfCart(id: string, deliveryQuotationId: string, deliveryPrice): Observable<CartDiscount>
     {
         let orderService = this._apiServer.settings.apiServer.orderService;
         //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
         let accessToken = "accessToken";
 
         const header = {  
             headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
             params: {
                deliveryPrice
             }
         };
 
         return this._httpClient.get<any>(orderService + '/carts/'+ id +'/discount', header)
             .pipe(
                 map((response) => {
                     this._logging.debug("Response from StoresService (getDiscountOfCart)",response);
 
                     return response["data"];
                 })
             );
     }
    
    // /**
    //  * Create the cart
    //  *
    //  * @param cart
    //  */
    // createCart(cart: Cart): Observable<any>
    // {
    //     let orderService = this._apiServer.settings.apiServer.orderService;
    //     //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
    //     let accessToken = "accessToken";

    //     const header = {  
    //         headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
    //     };

    //     return this._httpClient.post<any>(orderService + '/carts', cart, header)
    //         .pipe(
    //             map((response) => {
    //                 this._logging.debug("Response from StoresService (createCart)",response);

    //                 // set cart id
    //                 this.cartId = response["data"].id;

    //                 // set cart
    //                 this._cart.next(response);

    //                 return response["data"];
    //             })
    //         );
    // }

    // /**
    //  * Update the cart
    //  *
    //  * @param cart
    //  */
    // updateCart(cart: Cart): Observable<any>
    // {
    //     return this._httpClient.patch<Cart>('api/common/cart', {cart}).pipe(
    //         map((response) => {
    //             this._cart.next(response);
    //         })
    //     );
    // }
}
