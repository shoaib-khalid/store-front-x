import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory } from 'app/core/store/store.types';
import { HostListener } from "@angular/core";

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
    storeCategories: StoreCategory[];

    screenHeight: number;
    screenWidth: number;

    carouselCellsToShow: number = 1;
    carouselArrowsOutside: boolean = true;
    
    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _router: Router,
    )
    {
        this.onResize();
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

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            // Get store data
            this._storesService.store$
                .subscribe((response) => {
                    this.store = response;
                });
    
            // Get store categories data
            this._storesService.storeCategories$
                .subscribe((response) => {
                    this.storeCategories = response;
                });
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

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;

        // if 
        if (this.screenWidth < 500) {
            this.carouselCellsToShow = 1;
        } else if (this.screenWidth >= 500 && this.screenWidth <= 1000) {
            this.carouselCellsToShow = 3;
        } else {
            this.carouselCellsToShow = 4;
        }
    }
}
