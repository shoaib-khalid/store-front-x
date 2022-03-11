import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DOCUMENT } from '@angular/common'; 
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreSnooze, StoreTiming } from 'app/core/store/store.types';
import { of, Subject, Subscription, timer, interval as observableInterval } from 'rxjs';
import { takeWhile, scan, tap } from "rxjs/operators";
import { map, switchMap, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { CheckoutService } from './checkout.service';
import { CheckoutValidationService } from './checkout.validation.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChooseDeliveryAddressComponent } from './choose-delivery-address/choose-delivery-address.component';
import { CartDiscount, DeliveryProvider, DeliveryProviderGroup, Order, Payment } from './checkout.types';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

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

            ::ng-deep .mat-radio-button .mat-radio-ripple{
                display: none;
            }
        `
    ]
})
export class LandingCheckoutComponent implements OnInit
{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('checkoutNgForm') signInNgForm: NgForm;
    @ViewChild('checkoutContainer') checkoutContainer: ElementRef;
    
    checkoutForm: FormGroup;
    store: Store;

    storeSnooze: StoreSnooze = null;
    notificationMessage: string;
    daysArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    storeTimings: { days: string[], timing: string }[] = [];

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

    deliveryProvidersGroup: DeliveryProviderGroup[] = [];
    selectedDeliveryProvidersGroup: DeliveryProviderGroup;
    
    deliveryProviders: DeliveryProvider[] = [];
    selectedDeliveryProvider: DeliveryProvider;

    checkedDeliveryRefId: string = null;

    regionCountryStates: any;

    minQuantity: number = 1;
    maxQuantity: number = 100;

    currentScreenSize: string[] = [];

    isLoading: boolean = false;
    isCalculating: boolean = false;

    allowsStorePickup: boolean = false;

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
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _datePipe: DatePipe,
        private _dialog: MatDialog,
        private _router: Router,
        @Inject(DOCUMENT) document: Document
    )
    {
    }

    ngOnInit() {
        // Create the support form
        this.checkoutForm = this._formBuilder.group({
            // Main Store Section
            id                  : ['undefined'],
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
            regionCountryStateId: [''],
            specialInstruction  : [''],
            saveMyInfo          : [true]
        });

        // Set Payment Completion Status "Calculate Charges"
        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };

        // --------------
        // Get store
        // --------------
        this._storesService.store$
            .subscribe((response: Store) => {
                this.store = response;

                // -----------------------
                // Store Timings & Snooze
                // -----------------------
                
                // get store timings & snooze (for store closing)
                this._storesService.storeSnooze$
                    .subscribe((response: StoreSnooze) => {
                        this.storeSnooze = response;
                        
                        // check store timings
                        this.checkStoreTiming(this.store.storeTiming, this.storeSnooze);
        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // display store timing operating hour
                this.store.storeTiming.forEach(item => {
                    let index = this.storeTimings.findIndex(element => element.timing === item.openTime + " - " + item.closeTime);
                    if (item.isOff === false) {
                        if (index > -1) {
                            this.storeTimings[index].days.push(item.day)
                        } else {
                            this.storeTimings.push({
                                days:  [item.day],
                                timing: item.openTime + " - " + item.closeTime
                            });
                        }
                    }
                });

                // -----------------------
                // Service Charges
                // -----------------------

                // service charges percentage
                this.paymentDetails.storeServiceChargePercentage = this.store.serviceChargesPercentage;

                // Get subtotal discount
                this._checkoutService.getSubTotalDiscount(this._cartService.cartId$)
                    .subscribe((response: CartDiscount) => {

                        // update for subtotal only
                        this.paymentDetails.subTotalDiscount = response.subTotalDiscount;
                        this.paymentDetails.subTotalDiscountDescription = response.subTotalDiscountDescription;
                        this.paymentDetails.cartSubTotal = response.cartSubTotal;

                        this.paymentDetails.storeServiceChargePercentage = response.storeServiceChargePercentage;
                        this.paymentDetails.storeServiceCharge = response.storeServiceCharge;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // -----------------------
                // Store Country & States
                // -----------------------

                // set country
                this.checkoutForm.get('country').patchValue(this.store.regionCountry.name);

                // Get store states
                this._storesService.getStoreRegionCountryState(this.store.regionCountry.id)
                    .subscribe((response)=>{

                        this.regionCountryStates = response;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

                // -----------------------
                // Get cart item
                // -----------------------

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

                // ---------------------------
                // Get Store Delivery Details
                // ---------------------------

                this._storesService.getStoreDeliveryDetails(this.store.id)
                    .subscribe(response => {
                        this.allowsStorePickup = response.allowsStorePickup;
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                this.currentScreenSize = matchingAliases;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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

                    // recheck the getDiscountOfCart
                    this._checkoutService.getDiscountOfCart(this._cartService.cartId$, this.selectedDeliveryProvider.refId, this.selectedDeliveryProvider.deliveryType)
                        .subscribe((response)=>{
                            this.paymentDetails = {...this.paymentDetails, ...response};
                        });
                });
        }
    }

    deleteCartItem(cartItem: CartItem){
        
        // this._cartService.deleteCartItem(this._cartService.cartId$, cartItem.id)
        //     .subscribe((response)=>{                
        //     });

        //To make custom pop up, and we pass the details in paramter data
        let dialogRef = this._dialog.open(ModalConfirmationDeleteItemComponent, { disableClose: true, data:{cartId:this._cartService.cartId$,itemId:cartItem.id}});
        dialogRef.afterClosed().subscribe((result) => {
            
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

        if(this.checkoutForm.get('storePickup').value){
            this.checkoutForm.get('state').setErrors(null);
            this.checkoutForm.get('city').setErrors(null);
            this.checkoutForm.get('postCode').setErrors(null);
            this.checkoutForm.get('address').setErrors(null);
        }

        // set selectedDeliveryProvidersGroup to null
        this.selectedDeliveryProvidersGroup = null;

        // Set back delivery charges & grand total to 0
        this.paymentDetails.deliveryCharges = 0;
        this.paymentDetails.deliveryDiscount = 0;
        this.paymentDetails.cartGrandTotal = 0;

        // set this.deliveryProviders to empty array
        this.deliveryProviders = [];

        // set this.selectedDeliveryProvider to null
        this.selectedDeliveryProvider = null;

        // Set Payment Completion Status "Calculate Charges"
        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
                            this.checkoutForm.get('id').patchValue(response.id);
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

    executeAction(paymentCompletionStatusId) {
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
        this.isCalculating = true;
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
            this.isCalculating = false;
            this.isLoading = false;

            return;
        }

        // reset selectedDeliveryProvider
        this.selectedDeliveryProvider = null;
        this.checkoutForm.get('deliveryProviderId').patchValue(null);

        // retrieveDeliveryCharges if not store pickup
        if (this.checkoutForm.get('storePickup').value === false) {

            let _selectedStateIndex = this.regionCountryStates.findIndex(item => item.id === this.checkoutForm.get('state').value)           

            const deliveryChargesBody = {
                cartId: this._cartService.cartId$,
                customerId: this.checkoutForm.get("id").value,
                delivery: {
                    deliveryAddress: this.checkoutForm.get('address').value,
                    deliveryCity: this.checkoutForm.get('city').value,
                    deliveryState: (_selectedStateIndex > -1) ? this.regionCountryStates[_selectedStateIndex].name : this.checkoutForm.get('state').value,
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

                            // get getDiscountOfCart
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
                        // sort and categoried the delivery providers
                        this.deliveryProvidersGroup = [];
                        deliveryProviderResponse.forEach(item => {
                            if (this.deliveryProvidersGroup.length < 1) {
                                this.deliveryProvidersGroup.push({
                                    providerId: item.providerId,
                                    deliveryProviders: [item]
                                })
                            } else {
                                // find the same providerId
                                let index = this.deliveryProvidersGroup.findIndex(element => element.providerId === item.providerId);

                                if (index > -1) {
                                    this.deliveryProvidersGroup[index].deliveryProviders.push(item);
                                } else {
                                    this.deliveryProvidersGroup.push({
                                        providerId: item.providerId,
                                        deliveryProviders: [item]
                                    })
                                }
                            }
                        });
                                                
                        // load all delivery provider in mat-select without default provider
                        this.deliveryProviders = deliveryProviderResponse;
                    }
    
                    // Set Loading to false
                    this.isCalculating = false;
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
            this.isCalculating = false;
            this.isLoading = false;
        }
    }

    /**
     * 
     * @param deliveryProviderId 
     * @param deliveryProviderGroupType 
     */
    changeDeliveryProvider(deliveryProviderId: string, deliveryProviderGroupType: string = null) {

        if (this.store.verticalCode === 'E-Commerce') {
            if (deliveryProviderGroupType === null) {
                
                this.selectedDeliveryProvidersGroup = this.deliveryProvidersGroup.find(item => item.providerId === deliveryProviderId);
                // this is only to set the selectedDeliveryProvidersGroup,
                // not getting the price yet

                // find delivery with no error
                let index = this.selectedDeliveryProvidersGroup.deliveryProviders.findIndex(item => item.isError === false);

                if (index > -1) {
                    this.checkedDeliveryRefId = this.selectedDeliveryProvidersGroup.deliveryProviders[index].refId;
                } else {

                    let confirmation = this.displayError(this.selectedDeliveryProvidersGroup.deliveryProviders[0].providerName + " error: " + this.selectedDeliveryProvidersGroup.deliveryProviders[0].message);
                        
                    confirmation.afterClosed().subscribe((result) => {
                        // reset selectedDeliveryProvider
                        this.selectedDeliveryProvider = null;
                        this.checkoutForm.get('deliveryProviderId').patchValue(null);
    
                        // Set Payment Completion Status "Calculate Charges"
                        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };
                    });

                    return;
                }
            } 
        } 

        // Old flow

        // -------------------------------
        // Get selected delivery provider
        // -------------------------------

        let index = -1;
        if(deliveryProviderGroupType === 'group') { // for group, we'll search based on refId
            index = this.deliveryProviders.findIndex(item => item.refId === deliveryProviderId && item.isError === false );                
        } else {
            index = this.deliveryProviders.findIndex(item => item.providerId === deliveryProviderId);
        }
        
        if (index > -1) {

            this.checkoutForm.get('deliveryProviderId').patchValue(this.deliveryProviders[index].providerId);

            // set selected delivery provider
            this.selectedDeliveryProvider = this.deliveryProviders[index];

            if (this.selectedDeliveryProvider.isError === true) {

                // for this.store.verticalCode !== 'E-Commerce or deliveryProviderGroupType === group ... no need to popup since
                // we don't show the radio button for user to select 
                if (this.store.verticalCode !== 'E-Commerce') {
                    let confirmation = this.displayError(this.selectedDeliveryProvider.providerName + " error: " + this.selectedDeliveryProvider.message);
                    
                    confirmation.afterClosed().subscribe((result) => {
                        // reset selectedDeliveryProvider
                        this.selectedDeliveryProvider = null;
                        this.checkoutForm.get('deliveryProviderId').patchValue(null);
    
                        // Set Payment Completion Status "Calculate Charges"
                        this.paymentCompletionStatus = { id:"CALCULATE_CHARGES", label: "Calculate Charges" };
                    });
                }

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

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    onlinePay(){

        // Set Loading to true
        this.isLoading = true;

        const orderBody = {
            cartId: this._cartService.cartId$,
            customerId: this.checkoutForm.get("id").value, 
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
                    customerId: this.checkoutForm.get("id").value,
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
                                this.postForm("post-to-senangpay", this.payment.paymentLink, {"detail" : this.store.name, "amount": this.paymentDetails.cartGrandTotal.toFixed(2), "order_id": this.order.id, "name": this.order.orderShipmentDetail.receiverName, "email": this.order.orderShipmentDetail.email, "phone": this.order.orderShipmentDetail.phoneNumber, "hash": this.payment.hash },'post');
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
            customerId: this.checkoutForm.get("id").value, 
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

    postForm(id, path, params, method) {
        method = method || 'post';
    
        let form = document.createElement('form');
        form.setAttribute('method', method);
        form.setAttribute('action', path);
        form.setAttribute('id', id);
    
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                let hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', encodeURI(params[key]));
    
                form.appendChild(hiddenField);
            }
        }
    
        document.body.appendChild(form);        
        form.submit();
    }

    scrollToTop(el) {
        var to = 0;
        var duration = 1000;
        var start = el.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;
    
        var easeInOutQuad = function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) 
                return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    
        var animateScroll = function() {        
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);
    
            el.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
                el.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
        }
        animateScroll();    
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    checkStoreTiming(storeTiming: StoreTiming[], storeSnooze: StoreSnooze): void
    {
        // the only thing that this function required is this.store.storeTiming

        let todayDate = new Date();
        let today = this.daysArray[todayDate.getDay()];

        // check if store closed for all days
        let isStoreCloseAllDay = storeTiming.map(item => item.isOff);

        // --------------------
        // Check store timing
        // --------------------

        // isStoreCloseAllDay.includes(false) means that there's a day that the store is open
        // hence, we need to find the day that the store is open
        if (isStoreCloseAllDay.includes(false)) {
            storeTiming.forEach((item, index) => {
                if (item.day === today) {
                    // this mean store opened
                    if (item.isOff === false) {
                        let openTime = new Date();
                        openTime.setHours(Number(item.openTime.split(":")[0]), Number(item.openTime.split(":")[1]), 0);

                        let closeTime = new Date();
                        closeTime.setHours(Number(item.closeTime.split(":")[0]), Number(item.closeTime.split(":")[1]), 0);

                        if(todayDate >= openTime && todayDate < closeTime ) {
                            // console.info("We are OPEN today!");

                            // --------------------
                            // Check store snooze
                            // --------------------

                            let snoozeEndTime = new Date(storeSnooze.snoozeEndTime);
                            let nextStoreOpeningTime: string = "";                            

                            if (storeSnooze.isSnooze === true) {
                                // console.info("Store is currently on snooze");

                                // check if snoozeEndTime exceed closeTime
                                if (snoozeEndTime > closeTime) {
                                    // console.info("Store snooze exceed closeTime");

                                    // ------------------------
                                    // Find next available day
                                    // ------------------------

                                    let dayBeforeArray = storeTiming.slice(0, index + 1);
                                    let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                                    
                                    let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);                                
                                    nextAvailableDay.forEach((object, iteration, array) => {
                                        // this mean store opened
                                        if (object.isOff === false) {
                                            let nextOpenTime = new Date();
                                            nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);

                                            let nextCloseTime = new Date();
                                            nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);

                                            if(todayDate >= nextOpenTime){
                                                let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                                // console.info("We will open " + nextOpen);
                                                this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                                nextStoreOpeningTime = "Store will open " + nextOpen;
                                                array.length = iteration + 1;
                                            }
                                        } else {
                                            console.warn("Store currently snooze. Store close on " + object.day);
                                        }
                                    });

                                } else {
                                    nextStoreOpeningTime = "Store will open at " + this._datePipe.transform(storeSnooze.snoozeEndTime,'EEEE, h:mm a');
                                }                                

                                if (storeSnooze.snoozeReason && storeSnooze.snoozeReason !== null) {
                                    this.notificationMessage = "Sorry for the inconvenience, Store is currently closed due to " + storeSnooze.snoozeReason + ". " + nextStoreOpeningTime;
                                } else {
                                    this.notificationMessage = "Sorry for the inconvenience, Store is currently closed due to unexpected reason. " + nextStoreOpeningTime;
                                }
                            }
                            
                            // ---------------------
                            // check for break hour
                            // ---------------------
                            if ((item.breakStartTime && item.breakStartTime !== null) && (item.breakEndTime && item.breakEndTime !== null)) {
                                let breakStartTime = new Date();
                                breakStartTime.setHours(Number(item.breakStartTime.split(":")[0]), Number(item.breakStartTime.split(":")[1]), 0);
    
                                let breakEndTime = new Date();
                                breakEndTime.setHours(Number(item.breakEndTime.split(":")[0]), Number(item.breakEndTime.split(":")[1]), 0);

                                if(todayDate >= breakStartTime && todayDate < breakEndTime ) {
                                    // console.info("We are on BREAK! We will open at " + item.breakEndTime);
                                    this.notificationMessage = "Sorry for the inconvenience, We are on break! We will open at " + item.breakEndTime;
                                }
                            }
                        } else if (todayDate < openTime) {
                            // this mean it's open today but it's before store opening hour (store not open yet)
                            this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open at " + item.openTime;
                        } else {

                            // console.info("We are CLOSED for the day!");

                            // ------------------------
                            // Find next available day
                            // ------------------------

                            let dayBeforeArray = storeTiming.slice(0, index + 1);
                            let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                            
                            let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);                                
                            nextAvailableDay.forEach((object, iteration, array) => {
                                // this mean store opened
                                if (object.isOff === false) {
                                    let nextOpenTime = new Date();
                                    nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);

                                    let nextCloseTime = new Date();
                                    nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);

                                    if(todayDate >= nextOpenTime){
                                        let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                        // console.info("We will open " + nextOpen);
                                        this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                        array.length = iteration + 1;
                                    }
                                } else {
                                    console.warn("Store close on " + object.day);
                                }
                            });
                        }
                    } else {

                        console.warn("We are CLOSED today");
                        
                        // ------------------------
                        // Find next available day
                        // ------------------------

                        let dayBeforeArray = storeTiming.slice(0, index + 1);
                        let dayAfterArray = storeTiming.slice(index + 1, storeTiming.length);
                        
                        let nextAvailableDay = dayAfterArray.concat(dayBeforeArray);
            
                        nextAvailableDay.forEach((object, iteration, array) => {
                            // this mean store opened
                            if (object.isOff === false) {
                                
                                let nextOpenTime = new Date();                    
                                nextOpenTime.setHours(Number(object.openTime.split(":")[0]), Number(object.openTime.split(":")[1]), 0);
                                
                                let nextCloseTime = new Date();
                                nextCloseTime.setHours(Number(object.closeTime.split(":")[0]), Number(object.closeTime.split(":")[1]), 0);
                                  
                                if(todayDate >= nextOpenTime){
                                    let nextOpen = (iteration === 0) ? ("tommorow at " + object.openTime) : ("on " + object.day + " " + object.openTime);
                                    // console.info("We will open " + nextOpen);
                                    this.notificationMessage = "Sorry for the inconvenience, We are closed! We will open " + nextOpen;
                                    array.length = iteration + 1;
                                }
                            } else {
                                console.warn("Store close on this " + object.day);
                            }
                        });
                    }
                }
            });
        } else {
            // this indicate that store closed for all days
            this.notificationMessage = "Sorry for the inconvenience, We are closed!";
        }
    }

    // checkPickupOrder(){
    //     if
    //     this.checkoutForm.get('state').setErrors({required: false});
    //     this.checkoutForm.get('city').setErrors({required: false});
    //     this.checkoutForm.get('postCode').setErrors({required: false});
    //     this.checkoutForm.get('address').setErrors({required: false});
    // }
}
