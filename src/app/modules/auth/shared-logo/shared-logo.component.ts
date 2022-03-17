import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { StoresService } from 'app/core/store/store.service';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';

@Component({
    selector     : 'app-shared-logo',
    templateUrl  : './shared-logo.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SharedLogoComponent implements OnInit
{
    image: any=[];
    countryCode:string='';
    @Input() titleText: string;
    @Input() descriptionText: string;
    
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
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


      
    }



}
