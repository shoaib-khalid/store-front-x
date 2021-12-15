import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    currentSlider: number = 0;
    countDown:Subscription;
    counter = 1800;
    tick = 10000;
    
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
}
