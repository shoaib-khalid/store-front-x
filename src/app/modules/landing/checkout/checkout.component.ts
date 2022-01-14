import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { of, Subject, Subscription, timer } from 'rxjs';
import { map, switchMap, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { CheckoutService } from './checkout.service';
import { CheckoutValidationService } from './checkout.validation.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChooseDeliveryAddressComponent } from './choose-delivery-address/choose-delivery-address.component';
import { CartDiscount, DeliveryProvider, Order, Payment } from './checkout.types';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector     : 'landing-checkout',
    templateUrl  : './checkout.component.html',
    styles       : [
        `
        /** Custom input number **/
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      
        .custom-number-input input:focus {
          outline: none !important;
        }
      
        .custom-number-input button:focus {
          outline: none !important;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None
})
export class LandingCheckoutComponent implements OnInit
{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('checkoutNgForm') signInNgForm: NgForm;
    
    checkoutForm: FormGroup;
    store: Store;
    cartItems: CartItem[] = [];
    order: Order;
    payment: Payment;

    paymentDetails: CartDiscount = {
        cartSubTotal: 0,
        subTotalDiscount: 0,
        subTotalDiscountDescription: null,
        discountCalculationType: null,
        discountCalculationValue: 0,
        discountMaxAmount: 0,
        discountType: null,
        storeServiceChargePercentage: 0,
        storeServiceCharge: 0,
        deliveryCharges: 0, // not exist in (cart discount api), fetched from getPrice delivery service
        deliveryDiscount: 0,
        deliveryDiscountDescription: null,
        deliveryDiscountMaxAmount: 0,
        cartGrandTotal: 0
    }

    paymentCompletionStatus: {id: "CALCULATE_CHARGES", label: "Calculate Charges"} | {id: "PLACE_ORDER", label: "Place Order"} | {id: "ONLINE_PAY", label: "Pay Now"};

    deliveryProviders: DeliveryProvider[] = [];
    selectedDeliveryProvider: DeliveryProvider;

    minQuantity: number = 1;
    maxQuantity: number = 100;

    isLoading: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _storesService: StoresService,
        private _cartService: CartService,
        private _checkoutService: CheckoutService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _datePipe: DatePipe,
        private _dialog: MatDialog,
        private _router: Router,
    )
    {
    }

    ngOnInit() {
        // Create the support form
        this.checkoutForm = this._formBuilder.group({
            // Main Store Section
            fullName            : ['', Validators.required],
            // firstName           : ['', Validators.required],
            // lastName            : ['', Validators.required],
            email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
            phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
            address             : ['', Validators.required],
            storePickup         : [false],
            postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
            state               : ['', Validators.required],
            city                : ['', Validators.required],
            deliveryProviderId  : ['', CheckoutValidationService.deliveryProviderValidator],
            country             : [''],
            specialInstruction  : [''],
            saveMyInfo          : [false]
        });

        // Set Payment Completion Status "Calculate Charges"
        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };

        // --------------
        // Get store
        // --------------
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;

                this.paymentDetails.storeServiceChargePercentage = this.store.serviceChargesPercentage;

                // ---------------
                // Get cart item
                // ---------------
                this._cartService.cartItems$
                .subscribe((response: CartItem[])=>{
                    this.cartItems = response;

                    let subTotalArr = this.cartItems.map(item => {
                        return item.price;
                    });

                    // sum up the quantity in the array
                    this.paymentDetails.cartSubTotal = subTotalArr.reduce((sum, a) => sum + a, 0);                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });        
    }
    
    ngOnDestroy(){
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    updateQuantity(cartItem: CartItem, quantity: number, operator: string = null) {
        if (operator === 'decrement')
            quantity > this.minQuantity ? quantity -- : quantity = this.minQuantity;
        else if (operator === 'increment')
            quantity < this.maxQuantity ? quantity ++ : quantity = this.maxQuantity;
        else {
            if (quantity < this.minQuantity) 
                quantity = this.minQuantity;
            else if (quantity > this.maxQuantity)
                quantity = this.maxQuantity;
        }

        const cartItemBody = {
            cartId: cartItem.cartId,
            id: cartItem.id,
            itemCode: cartItem.itemCode,
            productId: cartItem.productId,
            quantity: quantity
        }

        if (!((cartItem.quantity === quantity) && (quantity === this.minQuantity || quantity === this.maxQuantity))) {
            this._cartService.putCartItem(this._cartService.cartId$, cartItemBody, cartItem.id)
                .subscribe((response)=>{
                });
        }
    }

    deleteCartItem(cartItem: CartItem){
        this._cartService.deleteCartItem(this._cartService.cartId$, cartItem.id)
            .subscribe((response)=>{
            });
    }

    allowPickupStore() {
        this.checkoutForm.get('storePickup').setValue(this.checkoutForm.get('storePickup').value);
    }

    goBack() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    displayError(message: string) {
        const confirmation = this._fuseConfirmationService.open({
            "title": "Error",
            "message": message,
            "icon": {
            "show": true,
            "name": "heroicons_outline:exclamation",
            "color": "warn"
            },
            "actions": {
            "confirm": {
                "show": true,
                "label": "Okay",
                "color": "warn"
            },
            "cancel": {
                "show": false,
                "label": "Cancel"
            }
            },
            "dismissible": true
        });

        return confirmation;
    }

    addressFormChanges() {
        // Set Payment Completion Status "Calculate Charges"
        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };
    }

    checkCustomerInfo(type: string, data: string) {
        const email =  type === "email" ? data : null;
        const phoneNumber =  type === "phoneNumber" ? data : null;
        this._checkoutService.getCustomerInfo(email, phoneNumber)
            .subscribe((response)=>{
                if (response && response.customerAddress.length > 0) {
                    let dialogRef = this._dialog.open(ChooseDeliveryAddressComponent, { disableClose: true, data: response });
                    dialogRef.afterClosed().subscribe((result) => {
                        if (result.isAddress === true) {
                            this.checkoutForm.get('fullName').patchValue(response.name);
                            if (type === "phoneNumber") this.checkoutForm.get('email').patchValue(response.email);
                            if (type === "email") this.checkoutForm.get('phoneNumber').patchValue(response.phoneNumber);
        
                            this.checkoutForm.get('address').patchValue(result.address);
                            this.checkoutForm.get('postCode').patchValue(result.postCode);
                            this.checkoutForm.get('state').patchValue(result.state);
                            this.checkoutForm.get('city').patchValue(result.city);
                            this.checkoutForm.get('country').patchValue(result.country);
                        }
                    });
                }
            })
    }

    executeAction(paymentCompletionStatusId){
        if (paymentCompletionStatusId === "CALCULATE_CHARGES") {
            this.calculateCharges();
        } else if (paymentCompletionStatusId === "PLACE_ORDER") {
            this.cashOnDeliveryPay();
        } else if (paymentCompletionStatusId === "ONLINE_PAY"){
            this.onlinePay();
        } else {
            console.error("Invalid Payment Completion Status")
        }
    }

    calculateCharges() {

        // Set Loading to true
        this.isLoading = true;

        // Do nothing if the form is invalid
        let BreakException = {};
        try {
            Object.keys(this.checkoutForm.controls).forEach(key => {
                const controlErrors: ValidationErrors = this.checkoutForm.get(key).errors;
                if (controlErrors != null) {
                    Object.keys(controlErrors).forEach(keyError => {
                        this.displayError(CheckoutValidationService.getValidatorErrorMessage(keyError, 0));
                        throw BreakException;
                    });
                }
            });
        } catch (error) {
            // Set Loading to false
            this.isLoading = false;

            return;
        }

        // reset selectedDeliveryProvider
        this.selectedDeliveryProvider = null;
        this.checkoutForm.get('deliveryProviderId').patchValue(null);

        // retrieveDeliveryCharges if not store pickup
        if (this.checkoutForm.get('storePickup').value === false) {
            const deliveryChargesBody = {
                cartId: this._cartService.cartId$,
                customerId: "undefined", // need to fix later when have customer login
                delivery: {
                    deliveryAddress: this.checkoutForm.get('address').value,
                    deliveryCity: this.checkoutForm.get('city').value,
                    deliveryState: this.checkoutForm.get('state').value,
                    deliveryPostcode: this.checkoutForm.get('postCode').value,
                    deliveryCountry: this.checkoutForm.get('country').value,
                    deliveryContactEmail: this.checkoutForm.get('email').value,
                    deliveryContactName: this.checkoutForm.get('fullName').value,
                    deliveryContactPhone: this.checkoutForm.get('phoneNumber').value
                },
                deliveryProviderId: null,
                storeId: this._storesService.storeId$
            }

            this._checkoutService.postToRetrieveDeliveryCharges(deliveryChargesBody)
                .subscribe((deliveryProviderResponse: DeliveryProvider[])=>{
    
                    if (deliveryProviderResponse.length === 0) {
                        // if there's no delivery provider, display error
                        this.displayError("No available delivery provider");
                        console.error("No available delivery provider")
                    } else if(deliveryProviderResponse.length === 1){
    
                        // load the delivery providers
                        this.deliveryProviders = deliveryProviderResponse;
                        
                        // if there's 1 delivery provider, load the delivery provider to mat-select
                        this.checkoutForm.get('deliveryProviderId').patchValue(this.deliveryProviders[0].providerId);
                        this.selectedDeliveryProvider = this.deliveryProviders[0];
    
                        if (this.selectedDeliveryProvider.isError === true) {
                            let confirmation = this.displayError(this.selectedDeliveryProvider.providerName + " error: " + this.selectedDeliveryProvider.message);
            
                            confirmation.afterClosed().subscribe((result) => {
                                // reset selectedDeliveryProvider
                                this.selectedDeliveryProvider = null;
                                this.checkoutForm.get('deliveryProviderId').patchValue(null);
                            });
                        } else {
                            this._checkoutService.getDiscountOfCart(this._cartService.cartId$, this.selectedDeliveryProvider.refId, this.selectedDeliveryProvider.deliveryType)
                            .subscribe((response)=>{
                                this.paymentDetails = {...this.paymentDetails, ...response};
                            });
        
                            // set price (this is based on delivery service api getPrice)
                            this.paymentDetails.deliveryCharges = this.selectedDeliveryProvider.price;
    
                            if(this.store.paymentType === "ONLINEPAYMENT") {
                                // change text to placeorder OR paynow
                                this.paymentCompletionStatus = { id: "ONLINE_PAY", label: "Pay Now" };
                            } else if (this.store.paymentType === "COD") {
                                // change text to placeorder OR paynow
                                this.paymentCompletionStatus = { id: "PLACE_ORDER", label: "Place Order" };
                            }
                        }
                    } else {
                        // load all delivery provider in mat-select without default provider
                        this.deliveryProviders = deliveryProviderResponse;
                    }
    
                    // Set Loading to false
                    this.isLoading = false;
                });
        } else {
            // Get discount for store pickup    
            this._checkoutService.getDiscountOfCart(this._cartService.cartId$, null, "PICKUP")
                .subscribe((response)=>{
                    this.paymentDetails = {...this.paymentDetails, ...response};

                    if(this.store.paymentType === "ONLINEPAYMENT") {
                        // change text to placeorder OR paynow
                        this.paymentCompletionStatus = { id: "ONLINE_PAY", label: "Pay Now" };
                    } else if (this.store.paymentType === "COD") {
                        // change text to placeorder OR paynow
                        this.paymentCompletionStatus = { id: "PLACE_ORDER", label: "Place Order" };
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            // Set Loading to false
            this.isLoading = false;
        }
    }

    changeDeliveryProvider(deliveryProviderId: string) {

        this.checkoutForm.get('deliveryProviderId').patchValue(deliveryProviderId);

        let index = this.deliveryProviders.findIndex(item => item.providerId === deliveryProviderId);
        
        if (index > -1) {

            // set selected delivery provider
            this.selectedDeliveryProvider = this.deliveryProviders[index];

            if (this.selectedDeliveryProvider.isError === true) {
                let confirmation = this.displayError(this.selectedDeliveryProvider.providerName + " error: " + this.selectedDeliveryProvider.message);

                confirmation.afterClosed().subscribe((result) => {
                    // reset selectedDeliveryProvider
                    this.selectedDeliveryProvider = null;
                    this.checkoutForm.get('deliveryProviderId').patchValue(null);

                    // Set Payment Completion Status "Calculate Charges"
                    this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };
                });

            } else {

                this._checkoutService.getDiscountOfCart(this._cartService.cartId$, this.selectedDeliveryProvider.refId, this.selectedDeliveryProvider.deliveryType)
                    .subscribe((response: CartDiscount)=>{
                        this.paymentDetails = {...this.paymentDetails, ...response};

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // set price (this is based on delivery service api getPrice)
                this.paymentDetails.deliveryCharges = this.selectedDeliveryProvider.price;

                if(this.store.paymentType === "ONLINEPAYMENT") {
                    // change text to placeorder OR paynow
                    this.paymentCompletionStatus = { id: "ONLINE_PAY", label: "Pay Now" };
                } else if (this.store.paymentType === "COD") {
                    // change text to placeorder OR paynow
                    this.paymentCompletionStatus = { id: "PLACE_ORDER", label: "Place Order" };
                }
            }

        } else {
            console.error("Invalid Delivery Provider");
        }
    }

    onlinePay(){

        // Set Loading to true
        this.isLoading = true;

        const orderBody = {
            cartId: this._cartService.cartId$,
            customerId: "undefined", // .. check this, this supposedly have values, idk where
            customerNotes: this.checkoutForm.get("specialInstruction").value,
            orderPaymentDetails: {
                accountName: this.checkoutForm.get('fullName').value, // ni mace saloh
                deliveryQuotationReferenceId: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.refId : null, // deliveryQuotationReferenceId not needed if it's a store pickup
            },
            orderShipmentDetails: {
                address:  this.checkoutForm.get("address").value,
                city: this.checkoutForm.get("city").value,
                country: this.checkoutForm.get("country").value,
                email: this.checkoutForm.get("email").value,
                phoneNumber: this.checkoutForm.get("phoneNumber").value,
                receiverName: this.checkoutForm.get('fullName').value,
                state: this.checkoutForm.get("state").value,
                storePickup: this.checkoutForm.get("storePickup").value,
                zipcode: this.checkoutForm.get("postCode").value,
                deliveryProviderId: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.providerId : null, // deliveryProviderId not needed if it's a store pickup
                deliveryType: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.deliveryType : "PICKUP" // deliveryType is "PICKUP" if it's a store pickup
            }
        };

        this._checkoutService.postPlaceOrder(this._cartService.cartId$, orderBody, this.checkoutForm.get('saveMyInfo').value)
            .subscribe((response) => {

                this.order = response;

                let dateTime = new Date()
                let transactionId = this._datePipe.transform(dateTime, "yyyyMMddhhmmss")

                const paymentBody = {
                    // callbackUrl: "https://bon-appetit.symplified.ai/thankyou",
                    customerId: "undefined",
                    customerName: this.checkoutForm.get('fullName').value,
                    // paymentAmount: this.paymentDetails.cartGrandTotal.toFixed(2),
                    productCode: "parcel", // 
                    storeName: this.store.name,
                    systemTransactionId: transactionId,
                    transactionId: this.order.id,
                }

                this._checkoutService.postMakePayment(paymentBody)
                    .subscribe((response) => {

                        this.payment = response;

                        if (this.payment.isSuccess === true) {
                            if (this.payment.providerId == "1") {
                                window.location.href = this.payment.paymentLink;
                            } else if (this.payment.providerId == "2") {                                
                                this.postForm(this.payment.paymentLink, {"detail" : this.store.name, "amount": this.paymentDetails.cartGrandTotal.toFixed(2), "order_id": this.order.id, "name": this.order.orderShipmentDetail.receiverName, "email": this.order.orderShipmentDetail.email, "phone": this.order.orderShipmentDetail.phoneNumber, "hash": this.payment.hash },'post');
                            } else {
                                this.displayError("Provider id not configured");
                                console.error("Provider id not configured");
                            }
                        }
                        // Set Loading to false
                        this.isLoading = false;
                    }, (error) => {
                        // Set Loading to false
                        this.isLoading = false;
                    });
            }, (error) => {
                // Set Loading to false
                this.isLoading = false;
            });
    }

    cashOnDeliveryPay() {

        // Set Loading to true
        this.isLoading = true;

        const orderBody = {
            cartId: this._cartService.cartId$,
            customerId: "undefined", // .. check this, this supposedly have values, idk where
            customerNotes: this.checkoutForm.get("specialInstruction").value,
            orderPaymentDetails: {
                accountName: this.checkoutForm.get('fullName').value, // ni mace saloh
                deliveryQuotationReferenceId: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.refId : null, // deliveryQuotationReferenceId not needed if it's a store pickup
            },
            orderShipmentDetails: {
                address:  this.checkoutForm.get("address").value,
                city: this.checkoutForm.get("city").value,
                country: this.checkoutForm.get("country").value,
                email: this.checkoutForm.get("email").value,
                phoneNumber: this.checkoutForm.get("phoneNumber").value,
                receiverName: this.checkoutForm.get('fullName').value,
                state: this.checkoutForm.get("state").value,
                storePickup: this.checkoutForm.get("storePickup").value,
                zipcode: this.checkoutForm.get("postCode").value,
                deliveryProviderId: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.providerId : null, // deliveryProviderId not needed if it's a store pickup
                deliveryType: (this.checkoutForm.get('storePickup').value === false) ? this.selectedDeliveryProvider.deliveryType : "PICKUP" // deliveryType is "PICKUP" if it's a store pickup
            }
        };
        this._checkoutService.postPlaceOrder(this._cartService.cartId$, orderBody, this.checkoutForm.get('saveMyInfo').value)
            .subscribe((response) => {
                // after success set the cartItem to empty array
                this.cartItems = [];
                // set in cart service
                this._cartService.cartItems = this.cartItems;

                this._router.navigate(['thankyou/SUCCESS/COD/ORDER_CONFIRMED']); 
            }, (error) => {
                // Set Loading to false
                this.isLoading = false;
            });
    }

    postForm(path, params, method) {
        method = method || 'post';
    
        var form = document.createElement('form');
        form.setAttribute('method', method);
        form.setAttribute('action', path);
    
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', params[key]);
    
                form.appendChild(hiddenField);
            }
        }
    
        document.body.appendChild(form);
        form.submit();
    }
}
