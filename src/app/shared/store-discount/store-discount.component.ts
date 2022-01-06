import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { DOCUMENT } from '@angular/common';
import { AcademyService } from 'app/modules/landing/academy/academy.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { StoresService } from 'app/core/store/store.service';
import { StoreDiscount } from 'app/core/store/store.types';

@Component({
    selector     : 'store-discount',
    templateUrl  : './store-discount.component.html',
    styles       : [``],
    encapsulation: ViewEncapsulation.None
})
export class DiscountBannerComponent implements OnInit
{

    @ViewChild('courseSteps', {static: true}) courseSteps: MatTabGroup;
    currentStep: number = 0;

    discounts: any[] = [];
    storeDiscounts: StoreDiscount[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _academyService: AcademyService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _storesService: StoresService
    )
    {
    }

    ngOnInit(){

        // Get the discounts
        this._storesService.storeDiscounts$
        .subscribe((response: StoreDiscount[]) => {
            console.log("disini",response);
            this.storeDiscounts = response;

            this.storeDiscounts.forEach(item => {
                this.discounts.push(...item.storeDiscountTierList.map(object => {
                    return {
                        discountName: item.discountName,
                        discountType: item.discountType,
                        startDate   : item.startDate,
                        endDate     : item.endDate,
                        maxDiscountAmount   : item.maxDiscountAmount,
                        normalPriceItemOnly : item.normalPriceItemOnly,

                        calculationType       : object.calculationType,
                        discountAmount        : object.discountAmount,
                        startTotalSalesAmount : object.startTotalSalesAmount
                    }
                }));
            })

            console.log("disana ---> ", this.discounts)

            // Go to step
            this.goToStep(0);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                //  this.drawerMode = 'side';
                //  this.drawerOpened = true;
                }
                else
                {
                //  this.drawerMode = 'over';
                //  this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    
    ngOnDestroy(){
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * Go to given step
     *
     * @param step
     */
    goToStep(step: number): void
    {
        // Set the current step
        this.currentStep = step;

        // Go to the step
        this.courseSteps.selectedIndex = this.currentStep;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Go to previous step
     */
    goToPreviousStep(): void
    {
        // Return if we already on the first step
        if ( this.currentStep === 0 )
        {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep - 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }
    
    /**
     * Go to next step
     */
    goToNextStep(): void
    {
        // Return if we already on the last step
        if ( this.currentStep === this.storeDiscounts.length - 1 )
        {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep + 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Scrolls the current step element from
     * sidenav into the view. This only happens when
     * previous/next buttons pressed as we don't want
     * to change the scroll position of the sidebar
     * when the user actually clicks around the sidebar.
     *
     * @private
     */
    private _scrollCurrentStepElementIntoView(): void
    {
        // Wrap everything into setTimeout so we can make sure that the 'current-step' class points to correct element
        setTimeout(() => {

            // Get the current step element and scroll it into view
            const currentStepElement = this._document.getElementsByClassName('current-step')[0];
            if ( currentStepElement )
            {
                currentStepElement.scrollIntoView({
                    behavior: 'smooth',
                    block   : 'start'
                });
            }
        });
    }
}