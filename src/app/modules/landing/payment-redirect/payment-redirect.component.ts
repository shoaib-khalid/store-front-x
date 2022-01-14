import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
        private _route: ActivatedRoute,
    )
    {
    }

    ngOnInit() {

        this.payment.name = this._route.snapshot.paramMap.get('name');
        this.payment.email = this._route.snapshot.paramMap.get('email');
        this.payment.phone = this._route.snapshot.paramMap.get('phone');
        this.payment.amount = this._route.snapshot.paramMap.get('amount');
        this.payment.hash = this._route.snapshot.paramMap.get('hash');
        this.payment.status_id = this._route.snapshot.paramMap.get('status_id');
        this.payment.order_id = this._route.snapshot.paramMap.get('order_id');
        this.payment.transaction_id = this._route.snapshot.paramMap.get('transaction_id');
        this.payment.msg = this._route.snapshot.paramMap.get('msg');        
    }

}
