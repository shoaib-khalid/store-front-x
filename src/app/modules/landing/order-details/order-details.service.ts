import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { StoresService } from 'app/core/store/store.service';
import { Customer } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { Order } from './order-details.type';

@Injectable({
    providedIn: 'root'
})
export class OrderDetailsService
{
    private _order: ReplaySubject<Order> = new ReplaySubject<Order>(1);
    private _orders: BehaviorSubject<Order[] | null> = new BehaviorSubject(null);


    // private _cart: ReplaySubject<Cart> = new ReplaySubject<Cart>(1);
    // private _cartItems: ReplaySubject<CartItem[]> = new ReplaySubject<CartItem[]>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _userService: UserService,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
    * Setter & getter for Orders
    *
    * @param value
    */

    get orders$(): Observable<Order[]>
    {
        return this._orders.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the Orders Info
     */
    getOrders( customerId: string = "151c0fb8-5f43-4e7d-8a9e-457929ec08fa", page: number = 0, size: number = 20): Observable<Customer>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                customerId         : '' + customerId,
                page       : '' + page,
                pageSize   : '' + size,
            }
        };

        return this._httpClient.get<any>(orderService + '/orders' , header)
        .pipe(
            tap((response) => {
                this._logging.debug("Response from orderService (getOrders)",response);

                this._orders.next(response["data"].content);
            })
        );
    }

    
    getOrdersWithDetails( customerId: string = "151c0fb8-5f43-4e7d-8a9e-457929ec08fa", page: number = 0, size: number = 20): Observable<Customer>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                customerId : '' + customerId,
                page       : '' + page,
                pageSize   : '' + size,
            }
        };

        return this._httpClient.get<any>(orderService + '/orders/details' , header)
        .pipe(
            tap((response) => {
                this._logging.debug("Response from orderService (getOrders)",response);

                this._orders.next(response["data"].content);
            })
        );
    }
    
}
