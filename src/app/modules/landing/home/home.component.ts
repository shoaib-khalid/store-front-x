import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreCategory, StoreDiscount } from 'app/core/store/store.types';
import { environment } from 'environments/environment';
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
    store: Store;
    storeCategories: StoreCategory[];
    storeDiscounts: StoreDiscount[];
    public version: string = environment.appVersion;

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
        private _storesService: StoresService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // (later ubah ni buang telak dekat shared component)
    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
    */
    ngOnInit() {

        this._storesService.store$
            .subscribe((response) => {
                this.store = response;
            });

        this._storesService.storeCategories$
            .subscribe((response) => {
                this.storeCategories = response;
            });

        this._storesService.storeDiscounts$
            .subscribe((response) => {
                console.log(response);
                this.storeDiscounts = response;
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

    chooseCategory(id) {
        let index = this.storeCategories.findIndex(item => item.id === id);
        if (index > -1) {
            let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');;
            this._router.navigate(['/catalogue/' + slug]);
        } else {
            console.error("Invalid category: Category not found");
        }
    }
}
