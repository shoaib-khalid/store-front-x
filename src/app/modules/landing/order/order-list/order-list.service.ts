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
import { DeliveryRiderDetails, Order, OrderDetails, OrderItem, OrderItemWithDetails } from './order-list.type';

@Injectable({
    providedIn: 'root'
})
export class OrderListService
{
    private _order: BehaviorSubject<Order | null> = new BehaviorSubject(null);
    private _orderItems: BehaviorSubject<OrderItem[] | null> = new BehaviorSubject(null);

    private _orders: BehaviorSubject<Order[] | null> = new BehaviorSubject(null);
    private _ordersDetails: BehaviorSubject<OrderDetails[] | null> = new BehaviorSubject(null);



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

    /**
    * Getter for orders
    */
    get order$(): Observable<any>
    {
        return this._order.asObservable();
    }

    get orders$(): Observable<Order[]>
    {
        return this._orders.asObservable();
    }

    /**
    * Setter & getter for Orders details
    *
    * @param value
    */

    get ordersDetails$(): Observable<OrderDetails[]>
    {
        return this._ordersDetails.asObservable();
    }
    
    /**
    * Getter for orderItems
    */
    get orderItems$(): Observable<any>
    {
        return this._orderItems.asObservable();
    }

    /**
    * Getter for access token
    */

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    } 

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the Orders Info
     */
    getOrders( customerId: string = "151c0fb8-5f43-4e7d-8a9e-457929ec08fa", page: number = 0, size: number = 20): Observable<Order>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "Bearer accessToken";

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

    
    getOrdersWithDetails( customerId: string = "151c0fb8-5f43-4e7d-8a9e-457929ec08fa", page: number = 0, size: number = 20): Observable<OrderDetails>
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

                this._ordersDetails.next(response["data"].content);
            })
        );
    }

    getOrderById(orderId): Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        let accessToken = "Bearer accessToken";
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
        
        return this._httpClient.get<Order>(orderService + '/orders/' + orderId, header)
        .pipe(
            tap((response) => {
                this._logging.debug("Response from OrdersService (getOrderById)",response);
                this._order.next(response.data);
            })
        )
    }

    getOrderItemsById(orderId): Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        let accessToken = "Bearer accessToken";
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
        
        return this._httpClient.get<OrderItem[]>(orderService + '/orders/' + orderId + '/items', header)
        .pipe(
            tap((response) => {
                this._logging.debug("Response from OrdersService (getOrderItemsById)",response);
                this._orderItems.next(response.data);
            })
        )
    }

    getDeliveryRiderDetails(orderId): Observable<DeliveryRiderDetails>
    {
        let deliveryService = this._apiServer.settings.apiServer.deliveryService;
        let accessToken = "Bearer accessToken";
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };
        
        return this._httpClient.get<any>(deliveryService + '/orders/getDeliveryRiderDetails/' + orderId , header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrdersService (getDeliveryRiderDetails)",response);
                    return response["data"];
                })
            );
    }

    getCompletionStatus(orderId, nextCompletionStatus)
    {

        let orderService = this._apiServer.settings.apiServer.orderService;
        let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let clientId = this._jwt.getJwtPayload(this.accessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this.orders$.pipe(
            take(1),
            switchMap(orders => this._httpClient.get<Order>(orderService + '/orders/details/' + orderId, header).pipe(
                map((response) => {

                    this._logging.debug("Response from OrdersService (getCompletionStatus) - Get Details By OrderId",response);

                    // Find the index of the updated product
                    const index = orders.findIndex(item => item.id === orderId);
                    
                    // Update the product
                    orders[index] = { ...orders[index], ...response["data"]};

                    // Update the products
                    this._orders.next(orders);

                    // Return the updated product
                    return response["data"];
                })
            ))
        );

        // this.orders$.subscribe((response)=>{

        //     let _orders = response;

            
        //     _orders.forEach(item => {
        //         if (item.id === orderId) {
        //             item.completionStatus = nextCompletionStatus;
        //         } 
        //     })


        //     this._orders.next(_orders);;
        // });
    }
    
}
