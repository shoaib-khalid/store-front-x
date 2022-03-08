import { Component, OnInit } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';

@Component({
    selector       : 'banner-slider',
    templateUrl    : './banner.component.html'
})
export class BannerComponent implements OnInit
{

    imageCollection:any = [];
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];
    mobileGalleryImages: NgxGalleryImage[] = [];

    store: Store = null;
    
    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService
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
        // initialise gallery
        // set galleryOptions
        this.galleryOptions = [
            {
                width: '1440x',
                height: '563px',
                imageAnimation: NgxGalleryAnimation.Slide,
                imageArrowsAutoHide: true, 
                imageBullets: true,
                imageAutoPlay: true,
                imageAutoPlayInterval: 5000,
                thumbnails: false,
                preview: false
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                width: '375px',
                height: '362px',
                imageAutoPlay: true,
                imageBullets: true,
                imageAutoPlayInterval: 5000,
                thumbnails: false,
                preview: false
            }
        ];

        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;

                if(this.store.storeAssets.length > 0) {
                    this.galleryImages = [];
                    this.mobileGalleryImages = [];
                    this.store.storeAssets.forEach(item => {
                        if (item.assetType === "BannerDesktopUrl") {
                            this.galleryImages.push({
                                small   : '' + item.assetUrl,
                                medium  : '' + item.assetUrl,
                                big     : '' + item.assetUrl
                            });
                        } else if (item.assetType === "BannerMobileUrl") {
                            this.mobileGalleryImages.push({
                                small   : '' + item.assetUrl,
                                medium  : '' + item.assetUrl,
                                big     : '' + item.assetUrl
                            });
                        }
                    });
                } else {
                    this.galleryImages = [
                        {
                            small   : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                            medium  : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                            big     : '' + 'https://symplified.biz/store-assets/banner-fnb.png'
                        }
                    ];
                    this.mobileGalleryImages = [
                        {
                            small   : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                            medium  : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                            big     : '' + 'https://symplified.biz/store-assets/banner-fnb.png'
                        }
                    ];
                }
            });
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

}
