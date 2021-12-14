import { Component, ViewEncapsulation } from '@angular/core';
import { LabelType, Options } from '@angular-slider/ngx-slider';

@Component({
    selector     : 'landing-catalogue',
    templateUrl  : './catalogue.component.html',
    styles       : [
        /* language=SCSS */
        `
        /** Custom range number slider **/
        ::ng-deep {
            .custom-slider .ngx-slider .ngx-slider-bar {
                background: red;
                height: 5px;
            }
            .custom-slider .ngx-slider .ngx-slider-selection {
                background: red;
            }
        
            .custom-slider .ngx-slider .ngx-slider-pointer {
                width: 10px;
                height: 15px;
                top: auto; /* to remove the default positioning */
                bottom: 0;
                background-color: red;
            }
        
            .custom-slider .ngx-slider .ngx-slider-pointer:after {
                display: none;
            }
        
            .custom-slider .ngx-slider .ngx-slider-bubble {
                bottom: 14px;
            }
        
            .custom-slider .ngx-slider .ngx-slider-limit {
                font-weight: bold;
                color: red;
            }
        
            .custom-slider .ngx-slider .ngx-slider-tick {
                width: 1px;
                height: 15px;
                margin-left: 4px;
                border-radius: 0;
                background: black;
                top: -1px;
            }
        
            .custom-slider .ngx-slider .ngx-slider-tick.ngx-slider-selected {
                background: red;
            }

            .custom-slider {
                .ngx-slider {
                  .ngx-slider-selection {
                    background: rgb(255, 255, 0) !important;
                  }
                }
            }
        }

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
    `],
    encapsulation: ViewEncapsulation.None
})
export class LandingCatalogueComponent
{

    minValue: number = 20;
    maxValue: number = 80;
    options: Options = {
      floor: 0,
      ceil: 100,
      step: 10,
      showTicks: true
    };

    quantity: number = 0;

    /**
     * Constructor
     */
    constructor()
    {
    }

    decrement() {
        this.quantity --;
    }
    
    increment() {
        this.quantity ++;
    }
}
