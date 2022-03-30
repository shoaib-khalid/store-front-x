import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Subject } from 'rxjs';
import { map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector     : 'app-shared-logo',
    templateUrl  : './shared-logo.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SharedLogoComponent implements OnInit
{
    image: any = [];
    countryCode:string = '';
    @Input() titleText: string;
    @Input() descriptionText: string;

    platform: Platform;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    /**
     * Constructor
     */
    constructor(
        private _platformsService: PlatformService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _storesService:StoresService,

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
        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;
            });
    }



}
