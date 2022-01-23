import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';

@Component({
    selector     : 'landing-thankyou',
    templateUrl  : './thankyou.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class LandingThankyouComponent
{

    store: Store;

    paymentType: string;
    completionStatus: string;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    ngOnInit() {

        this.paymentType = this._activatedRoute.snapshot.paramMap.get('payment-type');
        this.completionStatus = this._activatedRoute.snapshot.paramMap.get('completion-status');

        // Get the store info
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;
            });
    }
}
