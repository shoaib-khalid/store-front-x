import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAction, NgxGalleryAnimation } from 'ngx-gallery-9';

// import { DOCUMENT } from '@angular/platform-browser';
import 'hammerjs';
import * as Hammer from 'hammerjs';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [
        `
        /* 
            .ngx-gallery-thumbnails-wrapper {
                left: 0; 
                right: 0; 
                margin-left: auto; 
                margin-right: auto;
                width: 85% !important;
            }

            @media only screen and (max-width: 500px) {
                .ngx-gallery-thumbnails-wrapper {
                    width: 65% !important;
                }
            }

            .ngx-gallery-thumbnail {
                border-radius: 15px;
                background-color: #ccc;
                border: 2px solid #000;
                padding: 2em;
                width: 16em;
                height: 16em;
                position: relative;
                margin: 0 auto;
            }

            .ngx-gallery-thumbnail:before {
                border-radius: 10px;
                background: none;
                border: 2px solid #000;
                content: "";
                display: block;
                position: absolute;
                top: 2px;
                left: 2px;
                right: 2px;
                bottom: 2px;
                pointer-events: none;
            }

            .ngx-gallery-arrow i {
                color: #FFBF00;
            }

            .ngx-gallery-disabled i {
                color: gray;
            }
        */
        `
    ]
})
export class LandingHomeComponent implements OnInit
{

    // store: Store;
    // storeCategories: StoreCategory[];

    // imageCollection:any = [];
    // galleryOptions: NgxGalleryOptions[] = [];
    // galleryImages: NgxGalleryImage[] = [];

    /**
     * Constructor
     */
    constructor(
        // private _storesService: StoresService,
    )
    {
    }

    ngOnInit() {

        // initialise gallery
        // set galleryOptions
        // this.galleryOptions = [
        //     {
        //         width: '100%',
        //         height: '100%',
        //         thumbnailsColumns: 4,
        //         thumbnailsSwipe: true,
        //         thumbnailsArrows: true,
        //         thumbnailsMoveSize: 2,
        //         thumbnailsArrowsAutoHide: false,
        //         thumbnailsAsLinks: true,    
        //         thumbnailMargin: 20,

        //         arrowPrevIcon: 'fa fa-chevron-circle-left fa-2x',
        //         arrowNextIcon: 'fa fa-chevron-circle-right fa-2x',


        //         thumbnailActions: [
        //             {
        //                 icon: 'fa fa-chevron-circle-left',
        //                 onClick: () => {},
        //             }
        //         ],

        //         imageInfinityMove : true,
        //         linkTarget: '',
        //         image: false,
        //         preview: false
        //     },
        //     // max-width 767 Mobile configuration
        //     {
        //         breakpoint: 800,
        //         width: '100%',
        //         height: '350px',
        //         thumbnailsColumns: 2,
        //         thumbnailsSwipe: true,
        //         thumbnailsArrows: true,
        //         thumbnailsMoveSize: 2,
        //         thumbnailsAsLinks: true,
        //         linkTarget: '',
        //         thumbnailsArrowsAutoHide: false,
        //     },

        //     // max-width 767 Mobile configuration
        //     {
        //         breakpoint: 500,
        //         width: '100%',
        //         height: '350px',
        //         thumbnailsColumns: 1,
        //         thumbnailsSwipe: true,
        //         thumbnailsArrows: true,
        //         thumbnailsMoveSize: 1,
        //         thumbnailsAsLinks: true,
        //         linkTarget: '',
        //         thumbnailsArrowsAutoHide: false,
        //     }
        // ];

        // // Get store data
        // this._storesService.store$
        //     .subscribe((storeResponse) => {
        //         this.store = storeResponse;

        //         // Get store categories data
        //         this._storesService.storeCategories$
        //             .subscribe((storeCategoriesResponse) => {
        //                 this.storeCategories = storeCategoriesResponse;
        
        //                 this.storeCategories.forEach(item => {                            
        //                     this.galleryImages.push({
        //                         small   : item.thumbnailUrl ? item.thumbnailUrl : this.store.storeAsset.logoUrl,
        //                         medium  : item.thumbnailUrl ? item.thumbnailUrl : this.store.storeAsset.logoUrl,
        //                         big     : item.thumbnailUrl ? item.thumbnailUrl : this.store.storeAsset.logoUrl,
        //                         url     : "/catalogue/" + item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, ''),

        //                         label   : "test"
        //                     });
        //                 })
        //             });
        //     });
    }
}
