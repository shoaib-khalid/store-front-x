import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { PaymentRedirectService } from './payment-redirect.service';
import { DOCUMENT } from '@angular/common';


@Component({
    selector     : 'landing-payment-redirect',
    template     : ``,
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
        this._activatedRoute.queryParams.subscribe(params => {

            // senangPay redirect
            this.payment.name = params['name'];
            this.payment.email = params['email'];
            this.payment.phone = params['phone'];
            this.payment.amount = params['amount'];
            this.payment.hash = params['hash'];
            this.payment.status_id = params['status_id'];
            this.payment.order_id = params['order_id'];
            this.payment.transaction_id = params['transaction_id'];
            this.payment.msg = params['msg'];

            // fastPay redirect
            if (params['payment_channel'] === "fastpay"){
                this.payment.msg = params['err_code'];
                this.payment.msg = this.payment.msg + "-" + params['err_msg'];
                this.payment.transaction_id = params['basket_id'];
            }

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
        });
    }
}
