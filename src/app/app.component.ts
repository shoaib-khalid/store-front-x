import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StoresService } from './core/store/store.service';
import { Store } from './core/store/store.types';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{

    store: Store = null;

    favIcon16: HTMLLinkElement = document.querySelector('#appIcon16');
    favIcon32: HTMLLinkElement = document.querySelector('#appIcon32');

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _titleService: Title,
        private _storesService: StoresService
    )
    {
    }

    ngOnInit() {
        // Get current store
        this._storesService.store$
            .subscribe((response: Store)=>{

                this.store = response;
                if (this.store) {
                    this._titleService.setTitle(this.store.name);

                    if(this.store.verticalCode === "FnB" || this.store.verticalCode === "E-Commerce") {
                        this.favIcon16.href = 'assets/branding/deliverin/favicon/favicon-16x16.png';
                        this.favIcon32.href = 'assets/branding/deliverin/favicon/favicon-32x32.png';
                    } else if (this.store.verticalCode === "FnB_PK" || this.store.verticalCode === "ECommerce_PK") {
                        this.favIcon16.href = 'assets/branding/easydukan/favicon/favicon-16x16.png';
                        this.favIcon32.href = 'assets/branding/easydukan/favicon/favicon-32x32.png';
                    } else {
                        this.favIcon16.href = 'favicon-16x16.png';
                        this.favIcon32.href = 'favicon-32x32.png';
                    }
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
}
