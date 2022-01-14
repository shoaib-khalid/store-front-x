import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { PaymentRedirectService } from './payment-redirect.service';
import { DOCUMENT } from '@angular/common';


@Component({
    selector     : 'landing-payment-redirect',
    templateUrl  : './payment-redirect.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class LandingPaymentRedirectComponent
{
    payment: any = {
        name: null,
        email: null,
        phone: null,
        amount: null,
        hash: null,
        status_id: null,
        order_id: null,
        transaction_id: null,
        msg: null
    }

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _activatedRoute: ActivatedRoute,
        private _paymentRedirectService: PaymentRedirectService,
        private _storesService: StoresService
    )
    {
    }

    ngOnInit() {

        this.payment.name = this._activatedRoute.snapshot.paramMap.get('name');
        this.payment.email = this._activatedRoute.snapshot.paramMap.get('email');
        this.payment.phone = this._activatedRoute.snapshot.paramMap.get('phone');
        this.payment.amount = this._activatedRoute.snapshot.paramMap.get('amount');
        this.payment.hash = this._activatedRoute.snapshot.paramMap.get('hash');
        this.payment.status_id = this._activatedRoute.snapshot.paramMap.get('status_id');
        this.payment.order_id = this._activatedRoute.snapshot.paramMap.get('order_id');
        this.payment.transaction_id = this._activatedRoute.snapshot.paramMap.get('transaction_id');
        this.payment.msg = this._activatedRoute.snapshot.paramMap.get('msg');

        let status;
        if (this.payment.status_id == "1" || this.payment.status_id == 1) {
            status = "SUCCESS"
        } else {
            status = "FAILED"
        }

        this._paymentRedirectService.getOrderById(this.payment.order_id)
            .subscribe((response) => {
                let storeId = response.storeId;
                let paymentType = response.paymentType;

                this._storesService.getStoreById(storeId)
                    .subscribe((storeResponse) => {
                        let storeDomain = storeResponse.domain;
                        this._document.location.href = 'https://' + storeDomain + '/thankyou/' + status + '/' + paymentType + '/' + this.payment.msg;
                    });
            });
    }

}
