import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';

@Component({
    selector     : 'landing-product-details',
    templateUrl  : './product-details.component.html',
    styles       : [
        `
        /** Custom input number **/
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      
        .custom-number-input input:focus {
          outline: none !important;
        }
      
        .custom-number-input button:focus {
          outline: none !important;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None
})
export class LandingProductDetailsComponent implements OnInit
{ 

    store: Store;
    product: Product;
    quantity: number = 0;

    selectedInventoryItems: any;
    displayedProductPrice:number = 0;
    displayedProductItemCode: string;
    displayedProductSku: string;

    categorySlug: string;

    imageCollection:any = [];
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _router: Router
    )
    {
    }

    ngOnInit() {

        // Get the store info
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;
            });

        // initialise gallery
        // set galleryOptions
        this.galleryOptions = [
            {
                width: '350px',
                height: '350px',
                thumbnailsColumns: 3,
                imageAnimation: NgxGalleryAnimation.Slide,
                thumbnailsArrows: true,
                // previewDownload: true,
                imageArrowsAutoHide: true, 
                thumbnailsArrowsAutoHide: true,
                // "imageSize": "contain",
                "previewCloseOnClick": true, 
                "previewCloseOnEsc": true,
                // "thumbnailsRemainingCount": true
                
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                thumbnailsColumns: 2,
                width: '350px',
                height: '350px',
                // imagePercent: 100,
                // thumbnailsPercent: 30,
                // thumbnailsMargin: 10,
                // thumbnailMargin: 5,
            }
        ];

        // get product
        this._productsService.product$
            .subscribe((response: Product) => {
                this.product = response;

                // ----------------------------------
                // Get category info by category id
                // ----------------------------------

                this._storesService.getStoreCategoriesById(response.categoryId)
                    .subscribe((response: StoreCategory) => {
                        this.categorySlug = response.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
                    });
                
                // -----------------------
                // get cheapest item price
                // -----------------------
                let _cheapestItem = this.product.productInventories.reduce((r, e) => r.price < e.price ? r : e);


                // set initial selectedInventoryItems to the cheapest item
                this.selectedInventoryItems = _cheapestItem.productInventoryItems;

                if (this.selectedInventoryItems) {
                    this.displayedProductPrice = _cheapestItem.price;
                    this.displayedProductItemCode = _cheapestItem.itemCode;
                    this.displayedProductSku = _cheapestItem.sku;
                } 
                // else {
                //     this.displayedProductPrice = this.productInventories.price;
                //     this.displayedProductItemCode = this.productInventories.itemCode;
                //     this.displayedProductSku = this.productInventories.sku;
                // }

                // first this will push all images expect the one that are currently display
                response.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode != this.displayedProductItemCode){
                        this.imageCollection.push(_imageObject)
                    } 
                });

                // loop second one to push the one that are currently display in first array
                response.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode == this.displayedProductItemCode){
                        this.imageCollection.unshift(_imageObject)
                    }
                });
        
                // set to galerry images
                this.galleryImages = this.imageCollection
            });


    }

    goToCatalogue() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    decrement() {
        this.quantity --;
    }
    
    increment() {
        this.quantity ++;
    }
}
