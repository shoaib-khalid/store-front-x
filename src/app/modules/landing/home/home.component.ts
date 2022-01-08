import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory, StoreDiscount } from 'app/core/store/store.types';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { HostListener } from "@angular/core";

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [
        /* language=SCSS */
        `
        `]
})
export class LandingHomeComponent implements OnInit
{

    public version: string = environment.appVersion;
    
    store: Store;
    storeCategories: StoreCategory[];
    storeDiscounts: StoreDiscount[];

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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // (later ubah ni buang telak dekat shared component)
    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
    */
    ngOnInit() {

        this._storesService.store$
            .subscribe((response) => {
                this.store = response;
            });

        this._storesService.storeDiscounts$
            .subscribe((response) => {
                console.log(response);
                this.storeDiscounts = response;
            });
    }
}
