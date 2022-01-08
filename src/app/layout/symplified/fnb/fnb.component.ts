import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Subject, Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'fnb-layout',
    templateUrl  : './fnb.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FnbLayoutComponent implements OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public version: string = environment.appVersion;
    store: Store;

    isHomePage: boolean = true;

    currentSlider = {
        active  : null,
        previous: null,
        next    : null,
        current : 0,
        last    : 4
    };
    countDown: Subscription;
    counter:number = 1800;
    tick:number = 5000;

    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
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

        this.isHomePage = this._router.url === "/home" ? true : false;

        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.isHomePage = this._router.url === "/home" ? true : false;
        })

        // Slider
        // this.countDown = timer(0, this.tick)
        //     .subscribe(() => {
        //         if (this.currentSlider.current <= this.currentSlider.last) {
        //             this.currentSlider.active   = "translate-x-0";
        //             this.currentSlider.previous = "-translate-x-full",
        //             this.currentSlider.next     = "translate-x-full";
        //             this.currentSlider.current  = this.currentSlider.current + 1;
        //             if (this.currentSlider.current > this.currentSlider.last) {
        //                 this.currentSlider.active   = null;
        //                 this.currentSlider.previous = null,
        //                 this.currentSlider.next     = null;
        //                 this.currentSlider.current  = 0;
        //             }
        //         }
        //     });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    showSlider(sliderNumber) {
        this.currentSlider.current = sliderNumber;
    }
}
