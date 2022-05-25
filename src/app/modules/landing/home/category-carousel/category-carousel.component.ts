import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// import Swiper core and required modules
import SwiperCore, { Pagination, Navigation, EffectCoverflow } from "swiper";
import { SwiperComponent } from 'swiper/angular';

SwiperCore.use([Pagination, Navigation, EffectCoverflow]);

// const swiper = new Swiper('.swiper', {
//     navigation: {
//       nextEl: '.swiper-button-next',
//       prevEl: '.swiper-button-prev',
//     },
//     // Default parameters
//     slidesPerView: 3,
//     spaceBetween: 100,
//     slidesPerGroup: 1,
//     // Responsive breakpoints
//     breakpoints: {
//     //   // when window width is >= 320px
//     //   320: {
//     //     slidesPerView: 2,
//     //     spaceBetween: 20
//     //   },
//     //   // when window width is >= 480px
//     //   480: {
//     //     slidesPerView: 3,
//     //     spaceBetween: 30
//     //   },
//       // when window width is >= 640px
//       640: {
//         slidesPerView: 4,
//         spaceBetween: 0,
//         slidesPerGroup: 1
//       }
//     }
//   });

@Component({
    selector     : 'category-carousel',
    templateUrl  : './category-carousel.component.html',
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
          
        `],

    // styleUrls    : ['./category-carousel.component.scss'],
})
export class CategoryCarouselComponent
{    

    @ViewChild(SwiperComponent) swiper: SwiperComponent;
    
    store: Store;
    storeCategories: StoreCategory[] = [];

    // images:any = [];

    screenHeight: number;
    screenWidth: number;

    // carouselCellsToShow: number = 1;
    // carouselArrowsOutside: boolean = true;

    //Swiper
    swiperSlidesPerView: number = 4;
    swiperSpaceBetween: number = 0;
    swiperSlidesPerGroup: number = 4;
    swiperEffect: string = '';
    swiperCenteredSlides: boolean = false;
    itsMobile: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
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

        // Get store categories data
        this._storesService.storeCategories$
            .subscribe((response) => {
                
                if (response) {
                    this.storeCategories = response;                    
                }

                // this.storeCategories.forEach(item => {
                //     this.images.push({
                //         path: item.thumbnailUrl
                //     });
                // });

                // this.onResize();
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') ) {
                    // this.arrowsOutside = true;
                    // this.carouselCellsToShow = 4;
                } else if ( matchingAliases.includes('md') ) {
                    // this.arrowsOutside = true;
                    // this.carouselCellsToShow = 3;

                    //Swiper
                    this.swiperSlidesPerView = 4;
                    this.swiperSpaceBetween = 0;
                    this.swiperSlidesPerGroup = 4;
                    this.swiperEffect = '';

                } else if ( matchingAliases.includes('sm') ) {
                    // this.arrowsOutside = true;
                    // this.carouselCellsToShow = 2;

                    //Swiper
                    this.swiperSlidesPerView = 3;
                    this.swiperSpaceBetween = 100;
                    this.swiperSlidesPerGroup = 1;
                    this.swiperEffect = 'coverflow';
                    
                } else {
                    // this.arrowsOutside = false;
                    // this.carouselCellsToShow = 1;

                    //Swiper
                    this.swiperSlidesPerView = 3;
                    this.swiperSpaceBetween = 100;
                    this.swiperSlidesPerGroup = 1;
                    this.swiperEffect = 'coverflow';

                    this.itsMobile = true;
                }

                if ((this.swiperSlidesPerView > this.storeCategories.length) && this.itsMobile) {
                    this.swiperSlidesPerView = this.storeCategories.length;
                    this.swiperCenteredSlides = true;
                }
                else if (this.swiperSlidesPerView > this.storeCategories.length)
                {
                    this.swiperSlidesPerView = this.storeCategories.length;
                }

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

    chooseCategory(id) {
        let index = this.storeCategories.findIndex(item => item.id === id);
        if (index > -1) {
            let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
            this._router.navigate(['/catalogue/' + slug]);
        } else {
            console.error("Invalid category: Category not found");
        }
    }

    swipePrev() {
        this.swiper.swiperRef.slidePrev();
    }
    swipeNext() {
        this.swiper.swiperRef.slideNext();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    // @HostListener('window:resize', ['$event'])
    // onResize(event?) {
    //     this.screenHeight = window.innerHeight;
    //     this.screenWidth = window.innerWidth;

    //     // if 
    //     if (this.screenWidth < 500) {
    //         this.carouselCellsToShow = 1;
    //     } else if (this.screenWidth >= 500 && this.screenWidth <= 1000) {
    //         this.carouselCellsToShow = 3;
    //     } else {
    //         this.carouselCellsToShow = 4;           
    //     }

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    // }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
}
