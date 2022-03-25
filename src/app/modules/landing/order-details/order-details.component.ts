import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CheckoutService } from '../checkout/checkout.service';
import { CartDiscount } from '../checkout/checkout.types';
import { OrderDetailsService } from './order-details.service';
import { Order } from './order-details.type';

@Component({
    selector     : 'order-details',
    templateUrl  : './order-details.component.html',
    encapsulation: ViewEncapsulation.None
})
export class OrderDetailsComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];

    orders$: Observable<Order[]>;
    store: Store;
    cartItems: CartItem[] = [];

    regionCountryStates: any;

    paymentDetails: CartDiscount = {
        cartSubTotal: 0,
        subTotalDiscount: 0,
        subTotalDiscountDescription: null,
        discountCalculationType: null,
        discountCalculationValue: 0,
        discountMaxAmount: 0,
        discountType: null,
        storeServiceChargePercentage: 0,
        storeServiceCharge: 0,
        deliveryCharges: 0, // not exist in (cart discount api), fetched from getPrice delivery service
        deliveryDiscount: 0,
        deliveryDiscountDescription: null,
        deliveryDiscountMaxAmount: 0,
        cartGrandTotal: 0
    }

    /**
    * Constructor
    */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _orderSevice: OrderDetailsService,
        private _cartService: CartService,
        private _storesService: StoresService,
        private _checkoutService: CheckoutService,

    )
    {
    }

    ngOnInit() :void {

        this.orders$ = this._orderSevice.orders$;
        
        console.log("thisssifmf",this.orders$);
        
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {

            this.currentScreenSize = matchingAliases;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._orderSevice.getOrders().subscribe((response) =>{});

        // --------------
        // Get store
        // --------------
        this._storesService.store$
        .subscribe((response: Store) => {
            this.store = response;


            // -----------------------
            // Service Charges
            // -----------------------

            // service charges percentage
            this.paymentDetails.storeServiceChargePercentage = this.store.serviceChargesPercentage;

            // Get subtotal discount
            this._checkoutService.getSubTotalDiscount(this._cartService.cartId$)
            .subscribe((response: CartDiscount) => {

                // update for subtotal only
                this.paymentDetails.subTotalDiscount = response.subTotalDiscount;
                this.paymentDetails.subTotalDiscountDescription = response.subTotalDiscountDescription;
                this.paymentDetails.cartSubTotal = response.cartSubTotal;

                this.paymentDetails.storeServiceChargePercentage = response.storeServiceChargePercentage;
                this.paymentDetails.storeServiceCharge = response.storeServiceCharge;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            // -----------------------
            // Store Country & States
            // -----------------------

            // Get store states
            this._storesService.getStoreRegionCountryState(this.store.regionCountry.id)
            .subscribe((response)=>{

                this.regionCountryStates = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            // -----------------------
            // Get cart item
            // -----------------------

            this._cartService.cartItems$
            .subscribe((response: CartItem[])=>{
                this.cartItems = response;

                let subTotalArr = this.cartItems.map(item => {
                    return item.price;
                });

                // sum up the quantity in the array
                this.paymentDetails.cartSubTotal = subTotalArr.reduce((sum, a) => sum + a, 0);                    

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // this._orderSevice.orders$
        // .pipe(takeUntil(this._unsubscribeAll))
        // .subscribe((response: Order) => {            
        //     console.log("response sini:::", response);
        // });

        // Mark for check
        this._changeDetectorRef.markForCheck(); 
    }
    
}
