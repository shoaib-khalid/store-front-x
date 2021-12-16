import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { StoreCategory } from 'app/core/store/store.types';
import { Subscription, timer } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [
        /* language=SCSS */
        `
        `]
})
export class LandingHomeComponent implements OnInit
{
    storeCategories: StoreCategory[];

    currentSlider = {
        active  : null,
        previous: null,
        next    : null,
        current : 0,
        last    : 4
    };
    countDown:Subscription;
    counter = 1800;
    tick = 5000;
    
    /**S
     * Constructor
     */
    constructor(
        private _storesService: StoresService
    )
    {
    }

    ngOnInit() {

        this._storesService.storeCategories$.subscribe((response)=> {
            this.storeCategories = response;

            console.log("this.storeCategories", this.storeCategories)
        });

        // SLider
        this.countDown = timer(0, this.tick)
            .subscribe(() => {
                if (this.currentSlider.current <= this.currentSlider.last) {
                    this.currentSlider.active   = "translate-x-0";
                    this.currentSlider.previous = "-translate-x-full",
                    this.currentSlider.next     = "translate-x-full";
                    this.currentSlider.current  = this.currentSlider.current + 1;
                    if (this.currentSlider.current > this.currentSlider.last) {
                        this.currentSlider.active   = null;
                        this.currentSlider.previous = null,
                        this.currentSlider.next     = null;
                        this.currentSlider.current  = 0;
                    }
                }

            });
    }
    
    ngOnDestroy(){
        this.countDown=null;
    }
    
    showSlider(sliderNumber) {
        this.currentSlider.current = sliderNumber;
    }
}
