import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CheckoutService } from '../../checkout/checkout.service';
import { CartDiscount } from '../../checkout/checkout.types';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderInvoiceComponent } from '../order-invoice/order-invoice.component';

import { OrderListService } from './order-list.service';
import { Order, OrderDetails, OrderItemWithDetails } from './order-list.type';

@Component({
    selector     : 'order-list',
    templateUrl  : './order-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class OrderListComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];

    ordersDetails$: Observable<OrderDetails[]>;

    store: Store;
    cartItems: CartItem[] = [];
    orderList: OrderItemWithDetails[] = [];

    orderProgress: any;
    orderSlug: string;

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
        private _orderSevice: OrderListService,
        private _cartService: CartService,
        private _storesService: StoresService,
        private _checkoutService: CheckoutService,
        private _router: Router,
        public _dialog: MatDialog,
        private _activatedRoute: ActivatedRoute

    )
    {
    }

    ngOnInit() :void {

        this.orderProgress = [
            {
                name: "toPay",
            },
            {
                name: "toShip"
            },
            {
                name: "shipping"
            },
            {
                name: "completed"
            }
        ]

        this.orderSlug = this.orderSlug ? this.orderSlug : this._activatedRoute.snapshot.paramMap.get('order-slug');
        this.orderProgress.findIndex(item => item.name === this.orderSlug);

        this.ordersDetails$ = this._orderSevice.ordersDetails$;
                
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {

            this.currentScreenSize = matchingAliases;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._orderSevice.getOrdersWithDetails().subscribe((response) =>{});
        
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

        // Mark for check
        this._changeDetectorRef.markForCheck(); 
    }

    changeOrderDetails(value, event = null) {

        // find if categoty exists
        this.orderProgress.findIndex(item => item.name === value);
        // since all-product is not a real category, it will set to null
        // catalogue slug will be use in url
        
        this.orderProgress = value;
        
        this._router.navigate(['order/' + value]);

        this.reload();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    openDetailsDialog(orderId){
        
        // Open the dialog
        const dialogRef = this._dialog.open(OrderDetailsComponent, { data: orderId});
        
        dialogRef.afterClosed()
        .subscribe((result) => {
        });
    } 

    viewDetails(orderId){
        // this._router.navigateByUrl('/orders/'+orderId)
        const dialogRef = this._dialog.open(OrderInvoiceComponent, { panelClass: 'order-invoice-custom-dialog-class', data: orderId });
        
        dialogRef.afterClosed()
        .subscribe((result) => {
        });
        
    }
    
    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
}
