import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
    selector     : 'landing-product-details',
    templateUrl  : './product-details.component.html',
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
export class LandingProductDetailsComponent implements OnInit
{
    currentSlider: number = 0;
    countDown:Subscription;
    counter = 1800;
    tick = 15000;
    

    quantity: number = 0;

    /**
     * Constructor
     */
    constructor()
    {
    }

    ngOnInit() {
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
