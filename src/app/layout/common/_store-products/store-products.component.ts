import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { DOCUMENT } from '@angular/common';
import { StoreAssets } from 'app/core/store/store.types';
import { Product } from 'app/core/product/product.types';

declare let gtag: Function;
@Component({
    selector     : 'store-products',
    templateUrl  : './store-products.component.html',
    encapsulation: ViewEncapsulation.None
})
export class _StoreProductsComponent implements OnInit, OnDestroy
{

    platform: Platform;
    @Input() products: any;
    @Input() store: any;
    @Input() productViewOrientation: string = "grid"; 
    @Input() catalogueSlug: any;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _platformService: PlatformService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {        
        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform)=>{
                this.platform = platform;
            })   

            
        if (this.store.googleAnalyticId) {
            const items = []
            this.products.forEach((product) => items.push({
                id: product.id,
                name: product.name,
                quantity: product.productInventories[0].quantity,
                price: product.productInventories[0].price
            }))

            gtag("event", "view_item_list", {
                items: items
            })
        }
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

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    chooseStore(storeDomain:string) {
        let slug = storeDomain.split(".")[0]
        this._router.navigate(['/store/' + slug]);
    }

    redirectToProduct(product: Product) {
        // this._document.location.href = url;
        if (this.store.googleAnalyticId) {
            gtag("event", "select_content", {
                content_type: "product",
                items: [
                    {
                        id: product.id,
                        name: product.name,
                        quantity: product.productInventories[0].quantity,
                        price: product.productInventories[0].price
                    }
                ]
            }
        )}
        this._router.navigate(['/catalogue/' + '/' + this.catalogueSlug + '/' + product.seoName]);
        
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return this.platform.logo;
        }
    }
    
    isProductOutOfStock(product: Product): boolean
    {
        if (product.allowOutOfStockPurchases === true) {
            return true;
        } else {
            if (product.productInventories.length > 0) {
                let productInventoryQuantities = product.productInventories.map(item => item.quantity);
                let totalProductInventoryQuantity = productInventoryQuantities.reduce((partialSum, a) => partialSum + a, 0);
    
                if (totalProductInventoryQuantity > 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    displaySeeMore(productDescription){

        var div = document.createElement("div")
        div.innerHTML = productDescription
        div.style.width ="15rem";
        document.body.appendChild(div)

        if (div.offsetHeight > 100) {
            div.setAttribute("class","hidden")
            return true;
        } else {
            div.setAttribute("class","hidden")
            return false;
        }
    }
    
}
