import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';

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

        // console.log("this.completionStatus",this.completionStatus);
        

        // Get the store info
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;
            });
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
}
