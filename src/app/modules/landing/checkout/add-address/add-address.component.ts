import { PlatformLocation } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { StoresService } from 'app/core/store/store.service';
import { City, Store } from 'app/core/store/store.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { debounceTime, Observable, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { CheckoutService } from '../checkout.service';
import { CheckoutValidationService } from '../checkout.validation.service';

@Component({
    selector: 'add-address',
    templateUrl: './add-address.component.html'
})
export class AddAddressComponent implements OnInit {
    @ViewChild('stateCitySelector') stateCitySelector: MatSelect;

    createAddressForm: FormGroup;
    public regionCountryStateCities: FormControl = new FormControl();
    showButton: boolean = false;
    addresses: string[];
    selectedAddressId: string;

    customerAuthenticate: CustomerAuthenticate;
    user: any;
    state: any;
    regionCountryStates: any;
    store: Store;
    dialingCode: string;
    flashMessage: 'success' | 'error' | 'warning' | null = null;
    storeStateCities$: Observable<City[]>;
    public filteredCities: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private dialogRef: MatDialogRef<AddAddressComponent>,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _authService: AuthService,
        private _userService: UserService,
        private _storesService: StoresService,
        // @Inject(MAT_DIALOG_DATA) public data: MatDialog,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) { }

    ngOnInit(): void {

        

        // Create the support form
        this.createAddressForm = this._formBuilder.group({
            // Main Store Section
            fullName            : ['', Validators.required],
            // email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
            phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
            address             : ['', Validators.required],
            postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), CheckoutValidationService.postcodeValidator]],
            state               : ['', Validators.required],
            city                : ['', Validators.required],
        });

        this.setInitialValue();

        this.regionCountryStateCities.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((result) => {                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(this.createAddressForm.get('state').value, result, this.store? this.store.regionCountry.id : '' )
                .subscribe((response)=>{
                    
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });

        this.createAddressForm.get('state').valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((result) => {
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(result, '', this.store? this.store.regionCountry.id : '')
                .subscribe((response)=>{
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });

        this.store = this.data['store'];

        // -------------------------
        // Set Dialing code
        // -------------------------

        let countryId = this.store.regionCountry.id;

        switch (countryId) {
            case 'MYS':
                this.dialingCode = '60';
                this.createAddressForm.get('state').setValue('Selangor');
                break;

            case 'PAK':
                this.dialingCode = '92';
                this.createAddressForm.get('state').setValue('Federal');
                break;

            default:
                break;
        }

        // Get store states
        this._storesService.getStoreRegionCountryState(this.store.regionCountry.id)
            .subscribe((response)=>{                        
                this.regionCountryStates = response;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: User)=>{
                if (response) {
                    this.user = response;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        );

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
    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private setInitialValue() {
        this.filteredCities
            .pipe(take(1), takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.stateCitySelector.compareWith = (a: any, b: any) => a === b;
            });
            this.regionCountryStateCities.setValue([]);

    }
    
    cancel() {
        this.dialogRef.close({isAddress: false});
    }

    sanitizePhoneNumber(phoneNumber: string) {
        if (phoneNumber.match(/^\+?[0-9]+$/)) {
            let substring = phoneNumber.substring(0, 1)
            let countryId = this.store.regionCountry.id;
            let sanitizedPhoneNo = ''
            if ( countryId === 'MYS' ) {
                    if (substring === '6') sanitizedPhoneNo = phoneNumber;
                else if (substring === '0') sanitizedPhoneNo = '6' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '60' + phoneNumber;
            } else if ( countryId === 'PAK') {
                    if (substring === '9') sanitizedPhoneNo = phoneNumber;
                else if (substring === '2') sanitizedPhoneNo = '9' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '92' + phoneNumber;
            }
            return sanitizedPhoneNo;
        } else {
            return phoneNumber;
        }
    }

    createAddress() {

        const createAddressBody = {
            name       : this.createAddressForm.get('fullName').value,
            address    : this.createAddressForm.get('address').value,
            city       : this.createAddressForm.get('city').value,
            country    : this.store.regionCountry.name,
            customerId : this.user.id,
            email      : this.user.email,
            phoneNumber: this.createAddressForm.get('phoneNumber').value,
            postCode   : this.createAddressForm.get('postCode').value,
            state      : this.createAddressForm.get('state').value,
            isDefault  : false
        }

        this._userService.postCustomerAddress(this.user.id, createAddressBody)
            .subscribe((response) => {

                // Show a success message
                this.showFlashMessage('success');

                // Set delay before closing the details window
                setTimeout(() => {

                    // close the window
                    this.dialogRef.close({selectAddress: true, address: response});

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    
                }, 1500);
            });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error' | 'warning'): void
    {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }
}
