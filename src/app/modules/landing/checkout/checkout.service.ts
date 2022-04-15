import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { StoresService } from 'app/core/store/store.service';
import { Customer } from 'app/core/user/user.types';
import { CartDiscount, CustomerVoucher, CustomerVoucherPagination, DeliveryCharges, DeliveryProvider, UsedCustomerVoucherPagination } from './checkout.types';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService
{
    // private _cart: ReplaySubject<Cart> = new ReplaySubject<Cart>(1);
    // private _cartItems: ReplaySubject<CartItem[]> = new ReplaySubject<CartItem[]>(1);
    
    private _customerVoucher: ReplaySubject<CustomerVoucher> = new ReplaySubject<CustomerVoucher>(1);
    private _customerVouchers: ReplaySubject<CustomerVoucher[]> = new ReplaySubject<CustomerVoucher[]>(1);

    private _usedCustomerVoucher: ReplaySubject<CustomerVoucher> = new ReplaySubject<CustomerVoucher>(1);
    private _usedCustomerVouchers: ReplaySubject<CustomerVoucher[]> = new ReplaySubject<CustomerVoucher[]>(1);

    private _customerVoucherPagination: BehaviorSubject<CustomerVoucherPagination | null> = new BehaviorSubject(null);
    private _usedCustomerVoucherPagination: BehaviorSubject<UsedCustomerVoucherPagination | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
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

    /**
    * Getter for customer voucher
    */
    get customerVoucher$(): Observable<any>
    {
        return this._customerVoucher.asObservable();
    }

    get customerVouchers$(): Observable<CustomerVoucher[]>
    {
        return this._customerVouchers.asObservable();
    }

    /**
     * Getter for used customer voucher
     */
    get usedCustomerVoucher$(): Observable<any>
    {
        return this._usedCustomerVoucher.asObservable();
    }

    get usedCustomerVouchers$(): Observable<CustomerVoucher[]>
    {
        return this._usedCustomerVouchers.asObservable();
    }

    /**
     * Getter for cust voucher pagination
     */
    get customerVoucherPagination$(): Observable<CustomerVoucherPagination>
    {
        return this._customerVoucherPagination.asObservable();
    }

    /**
     * Getter for cust voucher pagination
     */
    get usedCustomerVoucherPagination$(): Observable<UsedCustomerVoucherPagination>
    {
        return this._usedCustomerVoucherPagination.asObservable();
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

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
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

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
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
    getDiscountOfCart(id: string, deliveryQuotationId: string = null, deliveryType: string, voucherCode: string = null, customerId: string = null): Observable<CartDiscount>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                deliveryQuotationId,
                deliveryType,
                voucherCode,
                customerId
            }
        };

        if (deliveryQuotationId === null) { delete header.params.deliveryQuotationId; }
        if (voucherCode === null) { delete header.params.voucherCode; }
        if (customerId === null) { delete header.params.customerId; }

        return this._httpClient.get<any>(orderService + '/carts/'+ id +'/discount', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getDiscountOfCart)",response);

                    return response["data"];
                })
            );
    }

    getSubTotalDiscount(id: string): Observable<CartDiscount>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.get<any>(orderService + '/carts/'+ id +'/subtotaldiscount', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getSubTotalDiscount)",response);

                    return response["data"];
                })
            );
    }

    postPlaceOrder(cartId: string, orderBody, saveInfo: boolean) : Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                cartId,
                saveCustomerInformation: saveInfo
            }
        };

        return this._httpClient.post<any>(orderService + '/orders/placeOrder', orderBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postPlaceOrder)",response);

                    return response["data"];
                })
            );
    }

    postMakePayment(paymentBody) : Observable<any>
    {
        let paymentService = this._apiServer.settings.apiServer.paymentService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.post<any>(paymentService + '/payments/makePayment', paymentBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postMakePayment)",response);

                    return response["data"];
                })
            );
    }

    getStoreRegionCountryState(regionCountryId: string): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "regionCountryId": regionCountryId
            }
        };

        return this._httpClient.get<any>(productService + '/region-country-state', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getStoreRegionCountryState)",response);
                    return response["data"].content;
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    //                                             Voucher
    // -----------------------------------------------------------------------------------------------------

    getAvailableVoucher () {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(orderService + '/voucher/available', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrderService (getAvailableVoucher)",response);

                    return response["data"].content

                    // this._vouchers.next(response["data"].content);
                })
            );
    }

    getAvailableCustomerVoucher (isUsed: boolean, page: number = 0, size: number = 2) : 
        Observable<{ customerVoucherPagination: CustomerVoucherPagination; usedCustomerVoucherPagination: UsedCustomerVoucherPagination; vouchers: CustomerVoucher[] }>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params : {
                isUsed,
                page       : '' + page,
                pageSize   : '' + size
            }
        };

        return this._httpClient.get<any>(orderService + '/voucher/claim/' + customerId, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrderService (getAvailableCustomerVoucher) isUsed: " + isUsed ,response);

                    if(isUsed){
                        let usedCustomerVoucherPagination = {
                            
                            length: response.data.totalElements,
                            size: response.data.size,
                            page: response.data.number,
                            lastPage: response.data.totalPages,
                            startIndex: response.data.pageable.offset,
                            endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                        }
                        this._usedCustomerVoucherPagination.next(usedCustomerVoucherPagination); 
                                                
                        this._usedCustomerVouchers.next(response["data"].content);
                        
                        return response["data"].content

                    } else {
                        let customerVoucherPagination = {

                            length: response.data.totalElements,
                            size: response.data.size,
                            page: response.data.number,
                            lastPage: response.data.totalPages,
                            startIndex: response.data.pageable.offset,
                            endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                        }
                        this._customerVoucherPagination.next(customerVoucherPagination); 
                        
                        this._customerVouchers.next(response["data"].content);

                        return response["data"].content
                    }     
                })
            );
    }

    postCustomerClaimVoucher(id: string, voucherCode: string) : Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        // let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.customerVouchers$.pipe(
            take(1),
            switchMap( customerVouchers => this._httpClient.post<any>(orderService + '/voucher/claim/' + id + '/' + voucherCode, {"voucherCode": voucherCode}, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrderService (postCustomerClaimVoucher)", response);

                    const updatedCustomerVouchers = customerVouchers;

                    updatedCustomerVouchers.unshift(response["data"]);
                    
                    this._customerVouchers.next(updatedCustomerVouchers);

                    return response["data"];
                })
            ))
        );

        // return this._httpClient.post<any>(orderService + '/voucher/claim/' + id + '/' + voucherCode, header)
        //     .pipe(
        //         map((response) => {
        //             this._logging.debug("Response from VoucherService (postCustomerClaimVoucher)",response);

        //             return response["data"];
        //         })
        //     );
    }
    
    // /**
    //  * Create the cart
    //  *
    //  * @param cart
    //  */
    // createCart(cart: Cart): Observable<any>
    // {
    //     let orderService = this._apiServer.settings.apiServer.orderService;
    //  
    //  

    //     const header = {  
    //         headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
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
