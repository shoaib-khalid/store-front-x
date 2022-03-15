import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';

@Component({
    selector     : 'landing-thankyou',
    templateUrl  : './thankyou.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class LandingThankyouComponent
{

    store: Store;
    cartId: string;

    paymentType: string;
    completionStatus: string;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _activatedRoute: ActivatedRoute,
        private _cartService: CartService
    )
    {
    }

    ngOnInit() {

        let currentCartId = this._cartService.cartId$

        let createCartBody = {
            customerId: null, // later make a getter to get logged in user
            storeId: this._storesService.storeId$,
        }

        this.paymentType = this._activatedRoute.snapshot.paramMap.get('payment-type');
        this.completionStatus = this._activatedRoute.snapshot.paramMap.get('completion-status');
        
        if(this.completionStatus === "Payment_was_successful" || this.completionStatus === "ORDER_CONFIRMED") {
            this._cartService.deleteCartbyId(currentCartId).subscribe((response) => {
            });
            
            this._cartService.createCart(createCartBody)
            .subscribe((cart: Cart)=>{
                // set cart id
                this.cartId = cart.id;

                if(this.cartId && this.cartId !== '') {
                    this.getCartItems(this.cartId);
                }
            });
        }
        // Get the store info
        this._storesService.store$
        .subscribe((response: Store) => {
            this.store = response;
        });
    }

    getCartItems(cartId: string){        
        if (cartId) {
            this._cartService.getCartItems(cartId)
            .subscribe((response)=>{
            });
        }
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
