import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { ProductsService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
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

    quantity: number = 1;
    minQuantity: number = 1;
    maxQuantity: number = 100;

    specialInstruction: string;

    selectedProductInventory: any;
    selectedProductInventoryItems: any;

    selectedVariants: any = [];
    selectedVariant: any = [];
    selectedVariantNew: any = [];

    combos: any = [];
    selectedCombo: any = [];

    productAssets: any;
    displayedProduct: any = {
        price: 0,
        itemCode: null,
        sku: null
    }

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
        private _cartService: CartService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

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

                if (this.product) {
                    
                    this._storesService.getStoreCategoriesById(response.categoryId)
                        .subscribe((response: StoreCategory) => {
                            this.categorySlug = response.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
                        });
                    
                    // -----------------------
                    // get cheapest item price
                    // -----------------------
                    this.selectedProductInventory = this.product.productInventories.reduce((r, e) => r.price < e.price ? r : e);
    
                    // set initial selectedProductInventoryItems to the cheapest item
                    this.selectedProductInventoryItems = this.selectedProductInventory.productInventoryItems;
    
                    if (this.selectedProductInventoryItems) {
                        this.displayedProduct.price = this.selectedProductInventory.price;
                        this.displayedProduct.itemCode = this.selectedProductInventory.itemCode;
                        this.displayedProduct.sku = this.selectedProductInventory.sku;
                    } 
                    else {
                        this.displayedProduct.price = this.selectedProductInventory.price;
                        this.displayedProduct.itemCode = this.selectedProductInventory.itemCode;
                        this.displayedProduct.sku = this.selectedProductInventory.sku;
                    }
    
                    // ------------------
                    // Product Assets
                    // ------------------
    
                    this.productAssets = this.product.productAssets;
    
                    // first this will push all images expect the one that are currently display
                    response.productAssets.forEach( object => {
                        let _imageObject = {
                            small   : '' + object.url,
                            medium  : '' + object.url,
                            big     : '' + object.url
                        }
                        
                        if(object.itemCode != this.displayedProduct.itemCode){
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
                        
                        if(object.itemCode == this.displayedProduct.itemCode){
                            this.imageCollection.unshift(_imageObject)
                        }
                    });
            
                    // set to galerry images
                    this.galleryImages = this.imageCollection
    
                    // -----------------------
                    // Product Variants
                    // -----------------------
    
                    // set currentVariant
                    this.selectedProductInventoryItems.forEach(item => {
                        this.selectedVariants.push(item.productVariantAvailableId)
                    });
    
                    // logic here is to extract current selected variant and to reconstruct new object with its string identifier 
                    // basically it create new array of object from this.product.productVariants to => this.requestParamVariant
                    let _productVariants = this.product.productVariants
                    _productVariants.map(variantBase => {
                        let _productVariantsAvailable = variantBase.productVariantsAvailable;
                        _productVariantsAvailable.forEach(element => {
                            this.selectedVariants.map(currentVariant => {
                                if(currentVariant.indexOf(element.id) > -1){
                                    let _data = {
                                        basename: variantBase.name,
                                        variantID: element.id,
                                    }
                                    this.selectedVariant.push(_data)
                                }
                            })
    
                        })
                    });
    
                    // -----------------------
                    // Product Combo
                    // -----------------------
    
                    // get product package if exists
                    if (this.product.isPackage) {
                        this._productsService.getProductPackageOptions(this.product.id)
                        .subscribe((response)=>{

                            this.combos = response["data"];
                            
                            this.combos.forEach(element => {
                                this.selectedCombo[element.id] = [];
                            });
    
                        });
                    }
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    goToCatalogue() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    addToCart() {
        const cartItemBody = {
            cartId: this._cartService.cartId$,
            itemCode: this.selectedProductInventory.itemCode,
            price: this.selectedProductInventory.price, // need to recheck & revisit
            productId: this.selectedProductInventory.productId,
            productPrice: this.selectedProductInventory.price, // need to recheck & revisit
            quantity: this.quantity,
            SKU: this.selectedProductInventory.sku,
            specialInstruction: this.specialInstruction
        };

        this._cartService.postCartItem(this._cartService.cartId$, cartItemBody)
            .subscribe(()=>{
                const confirmation = this._fuseConfirmationService.open({
                    "title": "Great",
                    "message": "Item successfully added to cart",
                    "icon": {
                      "show": true,
                      "name": "heroicons_outline:check",
                      "color": "success"
                    },
                    "actions": {
                      "confirm": {
                        "show": true,
                        "label": "Okay",
                        "color": "primary"
                      },
                      "cancel": {
                        "show": false,
                        "label": "Cancel"
                      }
                    },
                    "dismissible": true
                  });
            });
    }

    onChangeVariant(id, type, productID){     

        this.selectedVariant.map( variant => {
            if(variant.basename == type && variant.variantID != id){
                this.selectedVariant.find( oldVariant => oldVariant.basename === type).variantID = id
            }
        });

        this.selectedVariantNew = [];
        this.selectedVariant.forEach(element => {
            this.selectedVariantNew.push(element.variantID)
        });

        this.findInventory()
    }

    findInventory() {

        let toFind = this.selectedVariantNew;
        let productArr = this.product;
        let inventories = productArr.productInventories;
        let assetsArr = productArr.productAssets;

        let flag = true;
        let selectedProductInventory;
        let productInventoryItems;
        
        for (let i = 0; i < inventories.length; i++) {
            flag=true;
            selectedProductInventory = inventories[i]

            // find the inventory items
            productInventoryItems = inventories[i]['productInventoryItems']
            for (let j = 0; j < productInventoryItems.length; j++) {
                if(toFind.includes(productInventoryItems[j].productVariantAvailableId)){
                    continue;
                } else{
                    flag = false;
                    break;
                }
            }
            
            if(flag){

                this.selectedProductInventory = selectedProductInventory;

                this.displayedProduct.price = selectedProductInventory.price
                this.displayedProduct.itemCode = selectedProductInventory.itemCode
                this.displayedProduct.sku = selectedProductInventory.sku

                // reorder image collection 
                this.galleryImages = [];
                this.imageCollection = [];

                this.productAssets = assetsArr;

                // rearrange imageCollection 
                this.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode != this.displayedProduct.itemCode){
                        this.imageCollection.push(_imageObject)
                    }
                    
                });

                this.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode == this.displayedProduct.itemCode){
                        this.imageCollection.unshift(_imageObject)
                    }
                    
                });

                this.galleryImages = this.imageCollection
                // end of reorder image collection
            }
        }
    }

    onChangeCombo(comboId, productId , event){

        let productID = event.target.value;

        // remove only unchecked item in array
        if (event.target.checked === false) {
            let index = this.selectedCombo[comboId].indexOf(productID);
            if (index !== -1) {
                this.selectedCombo[comboId].splice(index, 1);
                return;
            }
        }

        let currentComboSetting = this.combos.find(item => item.id === comboId);
        
        // remove first item in array if it exceed totalAllow
        if (this.selectedCombo[comboId].length >= currentComboSetting.totalAllow){
            this.selectedCombo[comboId].shift();
        }

        // set currentCombo
        this.selectedCombo[comboId].push(productId);
    }

    checkQuantity(operator: string = null) {
        if (operator === 'decrement')
            this.quantity > this.minQuantity ? this.quantity -- : this.quantity = this.minQuantity;
        else if (operator === 'increment')
            this.quantity < this.maxQuantity ? this.quantity ++ : this.quantity = this.maxQuantity;
        else {
            if (this.quantity < this.minQuantity) 
                this.quantity = this.minQuantity;
            else if (this.quantity > this.maxQuantity)
                this.quantity = this.maxQuantity;
        }
    }
}
