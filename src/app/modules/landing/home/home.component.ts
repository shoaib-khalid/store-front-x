import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
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
    constructor()
    {
    }

    ngOnInit() {

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
