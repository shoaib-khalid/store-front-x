import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { CheckoutValidationService } from './checkout.validation.service';

@Component({
    selector     : 'landing-checkout',
    templateUrl  : './checkout.component.html',
    styles       : [
        `
        /** Custom input number **/
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      
        .custom-number-input input:focus {
          outline: none !important;
        }
      
        .custom-number-input button:focus {
          outline: none !important;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None
})
export class LandingCheckoutComponent implements OnInit
{

    checkoutForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
    )
    {
    }

    ngOnInit() {
        // Create the support form
        this.checkoutForm = this._formBuilder.group({
            // Main Store Section
            firstName           : ['', Validators.required],
            lastName            : ['', Validators.required],
            email               : ['', [Validators.required, Validators.email]],
            phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
            address             : ['', Validators.required],
            storePickup         : [false],
            postcode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
            state                : ['', Validators.required],
            city                : ['', Validators.required]           
        });
    }
    
    ngOnDestroy(){
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    allowPickupStore() {
        this.checkoutForm.get('storePickup').setValue(this.checkoutForm.get('storePickup').value);
    }

    goBack() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }
}
