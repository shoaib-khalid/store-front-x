import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { HostListener } from "@angular/core";
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector     : 'category-carousel',
    templateUrl  : './category-carousel.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [
        /* language=SCSS */
        `
        `]
})
export class CategoryCarouselComponent
{    
    store: Store;
    storeCategories: StoreCategory[] = [];

    // images:any = [];

    screenHeight: number;
    screenWidth: number;

    carouselCellsToShow: number = 1;
    carouselArrowsOutside: boolean = true;

    arrowsOutside: boolean = false;

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
        // this.onResize();
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
                this.storeCategories = response;

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

                console.log("matchingAliases", matchingAliases);
                

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') ) {
                    this.arrowsOutside = true;
                    this.carouselCellsToShow = 4;
                } else if ( matchingAliases.includes('md') ) {
                    this.arrowsOutside = true;
                    this.carouselCellsToShow = 3;
                } else if ( matchingAliases.includes('sm') ) {
                    this.arrowsOutside = true;
                    this.carouselCellsToShow = 2;
                } else {
                    this.arrowsOutside = false;
                    this.carouselCellsToShow = 1;
                }

                // if storeCategories is smaller , only show storeCategories.length as carouselCellsToShow
                if (this.carouselCellsToShow > this.storeCategories.length) {
                    this.carouselCellsToShow = this.storeCategories.length;
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
}
