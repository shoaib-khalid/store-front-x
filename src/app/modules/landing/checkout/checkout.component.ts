import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';

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
    currentSlider: number = 0;
    countDown:Subscription;
    counter = 1800;
    tick = 15000;

    checkoutForm: FormGroup;

    quantity: number = 0;

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
            username           : ['', Validators.required],
            name               : ['', Validators.required],
            email              : ['', [Validators.required, Validators.email]],
            // phoneNumber        : ['', RegisterStoreValidationService.phonenumberValidator],
            bankName           : ['', Validators.required],
            bankAccountNumber  : ['', Validators.required],
            
        });

        this.countDown = timer(0, this.tick)
        .subscribe(() => {
            if (this.currentSlider >= 1) {
                this.currentSlider = 0;
            } else {
                this.currentSlider++;
            }
        })
    }
    
    ngOnDestroy(){
        this.countDown=null;
    }
    
    showSlider(sliderNumber) {
        this.currentSlider = sliderNumber;
    }

    decrement() {
        this.quantity --;
    }
    
    increment() {
        this.quantity ++;
    }
}
