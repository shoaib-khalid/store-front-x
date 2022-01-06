import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { environment } from 'environments/environment';

@Component({
    selector     : 'store-header',
    templateUrl  : './store-header.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class StoreHeaderComponent implements OnInit
{

    public version: string = environment.appVersion;
    
    store: Store;
    
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
    }
}
