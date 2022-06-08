import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Cart, CartItem } from 'app/core/cart/cart.types';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { DOCUMENT } from '@angular/common';
import { AppConfig } from 'app/config/service.config';
import { StoresService } from 'app/core/store/store.service';
import { FloatingBannerService } from 'app/core/floating-banner/floating-banner.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
    selector       : 'floating-message-big',
    templateUrl    : './floating-message-big.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'floating-message-big'
})
export class FloatingMessageBigComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild('bannerPanel') private _bannerPanel: TemplateRef<any>;
    cart: Cart;
    sanatiseUrl: string;
    cartItem: CartItem[];
    cartItemQuantity: number = 0;
    image: string;
    redirectUrl: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _overlayRef: OverlayRef;
    nextPosition: number;

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _apiServer: AppConfig,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _authService: AuthService,
        private _storesService: StoresService,
        private _floatingBannerService: FloatingBannerService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._floatingBannerService.promoBig$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(promoBig => {
                if (promoBig) {
                    this.image = promoBig.bannerUrl;
                    this.redirectUrl = promoBig.redirectUrl;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            })

        
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void
    {
        if (this.image) {
            this.openPanel();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    closeMessage() {
        this._floatingBannerService.closeBigBanner();
        this.image = null;
        this._overlayRef.detach();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    uponClicked() {
        // sign up
        this._document.location.href = this.redirectUrl;
    }

    backdropClick() {
        this.closeMessage();
    }

    openPanel() {
        let config = {
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
        }
        this._overlayRef = this._overlay.create(config);      
        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._bannerPanel, this._viewContainerRef));        
      }

    
}
