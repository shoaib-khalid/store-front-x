import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// import Swiper core and required modules
import SwiperCore, { Pagination, Navigation, Autoplay } from "swiper";
import { SwiperComponent } from 'swiper/angular';

SwiperCore.use([Pagination, Navigation, Autoplay]);


@Component({
    selector     : 'swiper-banner',
    templateUrl  : './swiper-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [
        /* language=SCSS */
        `
        @import "swiper/css";
        @import "swiper/css/pagination";
        @import "swiper/css/navigation";
        @import "swiper/css/effect-cards";

        .swiper {
            width: 100%;
            height: 100%;
          }
          
        .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #fff;
        
        /* Center slide text vertically */
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        }
        
        .swiper-slide img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        }

        /* Pagination */
        .swiper-pagination { 
            top: 88%;
            @screen sm {
                top: 88%;
            }
            @screen md {
                top: 92%;
            }
            .swiper-pagination-bullet { 
                     
                    width: 0.7rem; 
                    height: 0.7rem; 
                    opacity: 20%;
                    border: 1.3px solid white;
                } 

            .swiper-pagination-bullet-active { 
                background: var(--fuse-primary); 
                opacity: 1; 
                border: 1.3px solid white;
            } 
        }
        
        /* to customize Navigation buttons */
        // .swiper-button-next:after, .swiper-button-prev:after {
        //     position: absolute;
        //     top: 50%;
        //     width: calc(var(--swiper-navigation-size) / 44 * 27);
        //     height: var(--swiper-navigation-size);
        //     margin-top: calc(0px - var(--swiper-navigation-size) / 2);
        //     z-index: 10;
        //     cursor: pointer;
        //     display: flex;
        //     align-items: center;
        //     justify-content: center;
        //     color: var(--fuse-primary);

        // }
          
        `],

    // styleUrls    : ['./category-carousel.component.scss'],
})
export class SwiperBannerComponent
{    

    @ViewChild(SwiperComponent) swiper: SwiperComponent;
    
    store: Store;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    galleryImages: string[] = [];
    mobileGalleryImages: string[] = [];
    currentScreenSize: string[];

    
    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _router: Router,
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
        // Get store data
        this._storesService.store$
        .subscribe((response) => {
            this.store = response;
        });

        this._storesService.store$
        .subscribe((response: Store) => {
            this.store = response;

            if(this.store.storeAssets.length > 0) {
                this.galleryImages = [];
                this.mobileGalleryImages = [];
                this.store.storeAssets.forEach(item => {
                    if (item.assetType === "BannerDesktopUrl") {
                        this.galleryImages.push(item.assetUrl);
                    } else if (item.assetType === "BannerMobileUrl") {
                        this.mobileGalleryImages.push(item.assetUrl);
                    }
                });
            } 
            else {
                this.galleryImages.push('https://symplified.biz/store-assets/banner-fnb.png')
                this.mobileGalleryImages.push('https://symplified.biz/store-assets/banner-fnb.png') 
            }
        });

 
        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {               

            this.currentScreenSize = matchingAliases;                

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

        setTimeout(() => {
            
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    swipePrev() {
        this.swiper.swiperRef.slidePrev();
    }
    swipeNext() {
        this.swiper.swiperRef.slideNext();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

}
