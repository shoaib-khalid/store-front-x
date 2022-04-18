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
import { Address } from '../checkout.types';
import { CheckoutValidationService } from '../checkout.validation.service';

@Component({
  selector: 'edit-address',
  templateUrl: './edit-address.component.html'
})
export class EditAddressComponent implements OnInit {

  editAddressForm: FormGroup;
  addressId: string;

  showButton: boolean = false;
  addresses: string[];
  selectedAddressId: string;

  customerAuthenticate: CustomerAuthenticate;
  user: any;
  state: any;
  regionCountryStates: any;
  store: Store;

  constructor(
    private dialogRef: MatDialogRef<EditAddressComponent>,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _checkoutService: CheckoutService,
    private _authService: AuthService,
    private _userService: UserService,
    private _storesService: StoresService,

    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {

    this.addressId = this.data['addressId'];
    this.store = this.data['store'];    
    
    // Create the support form
    this.editAddressForm = this._formBuilder.group({
      // Main Store Section
      name                : ['', Validators.required],
      email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
      phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
      address             : ['', Validators.required],
      postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
      state               : ['', Validators.required],
      city                : ['', Validators.required],
      isDefault           : [false]
    });

    this._userService.getCustomerAddressById(this.addressId)
    .subscribe((response: Address) => {
 
      const selectedAddress = response["data"];      

      // Fill the form step 1
      this.editAddressForm.patchValue(selectedAddress);
    });

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

  chooseAddress() {
  }

  updateAddress() {

    const editAddressBody = {
      id         : this.addressId,
      name       : this.editAddressForm.get('name').value,
      address    : this.editAddressForm.get('address').value,
      city       : this.editAddressForm.get('city').value,
      country    : this.state,
      customerId : this.user.id,
      email      : this.editAddressForm.get('email').value,
      phoneNumber: this.editAddressForm.get('phoneNumber').value,
      postCode   : this.editAddressForm.get('postCode').value,
      state      : this.editAddressForm.get('state').value,
      isDefault  : this.editAddressForm.get('isDefault').value
    }

    this._userService.updateCustomerAddress(this.addressId, editAddressBody)
    .subscribe((response) => {

      this.dialogRef.close({selectAddress: true, address: response});
    });

  }

}