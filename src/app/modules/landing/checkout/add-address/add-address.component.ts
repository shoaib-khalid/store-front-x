import { PlatformLocation } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { CheckoutService } from '../checkout.service';
import { CheckoutValidationService } from '../checkout.validation.service';

@Component({
  selector: 'add-address',
  templateUrl: './add-address.component.html'
})
export class AddAddressComponent implements OnInit {

  createAddressForm: FormGroup;

  showButton: boolean = false;
  addresses: string[];
  selectedAddressId: string;

  customerAuthenticate: CustomerAuthenticate;
  user: any;
  state: any;
  regionCountryStates: any;
  store: Store;
  dialingCode: string;

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
      email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
      phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
      address             : ['', Validators.required],
      postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
      state               : ['Selangor', Validators.required],
      city                : ['', Validators.required],
    });

    this._authService.customerAuthenticate$
    .subscribe((response: CustomerAuthenticate) => {
        
      this.customerAuthenticate = response;   

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    this.store = this.data['store'];

    // -------------------------
    // Set Dialing code
    // -------------------------
    
    let countryId = this.store.regionCountry.id;
    
    switch (countryId) {
        case 'MYS':
            this.dialingCode = '+60'
            break;
    
        case 'PAK':
            this.dialingCode = '+92'
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
    })
    
    this._userService.user$
      .subscribe((response: User)=>{
        
        this.user = response
      }
    );

  }

  cancel() {
    this.dialogRef.close({isAddress: false});
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  sanitizePhoneNumber(phoneNumber: string) {

    let substring = phoneNumber.substring(0, 1)
    let countryId = this.store.regionCountry.id;
    let sanitizedPhoneNo = ''
    
    if ( countryId === 'MYS' ) {

             if (substring === '6') sanitizedPhoneNo = phoneNumber;
        else if (substring === '0') sanitizedPhoneNo = '6' + phoneNumber;
        else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
        else                        sanitizedPhoneNo = '60' + phoneNumber;

    }
    else if ( countryId === 'PAK') {

             if (substring === '9') sanitizedPhoneNo = phoneNumber;
        else if (substring === '2') sanitizedPhoneNo = '9' + phoneNumber;
        else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
        else                        sanitizedPhoneNo = '92' + phoneNumber;

    }

    return sanitizedPhoneNo;
}

  createAddress() {

    const createAddressBody = {
      name       : this.createAddressForm.get('fullName').value,
      address    : this.createAddressForm.get('address').value,
      city       : this.createAddressForm.get('city').value,
      country    : this.store.regionCountry.name,
      customerId : this.user.id,
      email      : this.createAddressForm.get('email').value,
      phoneNumber: this.createAddressForm.get('phoneNumber').value,
      postCode   : this.createAddressForm.get('postCode').value,
      state      : this.createAddressForm.get('state').value,
      isDefault  : false
    }

    this._userService.postCustomerAddress(this.user.id, createAddressBody)
    .subscribe((response) => {

      this.dialogRef.close({selectAddress: true, address: response});
    });

  }

}
