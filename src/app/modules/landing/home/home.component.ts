import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class LandingHomeComponent implements OnInit
{

    store: Store;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
    }

    ngOnInit() {
        
        // Get store data
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storeResponse) => {
                this.store = storeResponse;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
}
