import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { Cart, CartItem, CustomerCart } from 'app/core/cart/cart.types';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Store } from 'app/core/store/store.types';
import { DOCUMENT } from '@angular/common';
import { StoresService } from 'app/core/store/store.service';
import { AppConfig } from 'app/config/service.config';

@Component({
    selector       : 'cart',
    templateUrl    : './cart.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'cart'
})
export class CartComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    cart: Cart;
    user: User;
    carts: Cart[] = [];
    totalCartList: number = 0;
    cartItem: CartItem[];
    cartItemQuantity: number = 0;
    seeMoreCarts: boolean = true;
    store: Store;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _cartService: CartService,
        private _authService: AuthService,
        private _userService: UserService,
        private _storeService: StoresService,
        private _apiServer: AppConfig,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        this._storeService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((store: Store)=>{
                this.store = store;     
            });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User)=>{
                this.user = user;   
                
                this._cartService.getCartsByCustomerId(this.user.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((carts: CustomerCart) => {
                        
                        if (carts) {

                            this.totalCartList = carts.cartList.length;
                                                
                            let cartArr = carts.cartList;

                            // get index for cart of current store to sort the array
                            let index = carts.cartList.findIndex(x => x.storeId === this.store.id)
                            
                            if (index > -1) {
                                // sort carts by current store
                                if (0 >= cartArr.length) {
                                    let k = 0 - cartArr.length + 1;
                                    while (k--) {
                                        cartArr.push(undefined);
                                    }
                                }
                                cartArr.splice(0, 0, cartArr.splice(index, 1)[0]);
                                this.carts = cartArr; 
                            }
                            // if no cart for this store
                            else this.carts = carts.cartList;
                            
                            // remove duplicate stores if any
                            let resArr = [];
                            this.carts.filter(function(item){
                                let i = resArr.findIndex(x => (x.storeId == item.storeId));
            
                                if (i <= -1){
                                    resArr.push(item);
                                }
                                return null;
                            });
                            
                            // to show only 3
                            if (resArr.length >= 3) {
                                const slicedArray = resArr.slice(0, 3);
                                this.carts = slicedArray;
                            }
            
                        }
                        else {
                            this.seeMoreCarts = false
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                });

        this._cartService.cartItems$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: CartItem[]) => {
                this.cartItem = response;

                // return array of quantity of each cartItem
                let _cartItemQttyArr: number[] = this.cartItem.map(item => {
                    return item.quantity;
                });

                // sum up the quantity in the array
                this.cartItemQuantity = _cartItemQttyArr.reduce((sum, a) => sum + a, 0);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    redirectToStore(store: Store, cartId: string) {

        if (store.id === this.store.id) {
            this._router.navigate(['/checkout']);
        }
        else {
            this._document.location.href = 'https://' + store.domain + '/checkout' +
             '?customerCartId=' + cartId;
        }
    }

    displayStoreLogo(store: Store) {
        // let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (store.storeLogoUrl != null) {
            return store.storeLogoUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    seeMoreRedirect(): void
    {
        // this._router.navigate(['/profile']);

        this._document.location.href = 'https://' + this._apiServer.settings.marketplaceDomain + '/carts';
    }
    
}
