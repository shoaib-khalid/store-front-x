import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    NgZone,
} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    NgForm,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import {
    City,
    Store,
    StoreAssets,
    StoreSnooze,
    StoreTiming,
} from 'app/core/store/store.types';
import {
    of,
    Subject,
    Observable,
    ReplaySubject,
    take,
    ConnectableObservable,
} from 'rxjs';
import {
    map,
    switchMap,
    takeUntil,
    debounceTime,
    catchError,
} from 'rxjs/operators';
import { CheckoutService } from './checkout.service';
import { CheckoutValidationService } from './checkout.validation.service';
import { MatDialog } from '@angular/material/dialog';
import { ChooseDeliveryAddressComponent } from './choose-delivery-address/choose-delivery-address.component';
import {
    Address,
    CartDiscount,
    CustomerVoucher,
    CustomerVoucherPagination,
    DeliveryProvider,
    DeliveryProviderGroup,
    Order,
    Payment,
    UsedCustomerVoucherPagination,
    CheckoutInputField,
    VoucherVerticalList,
    PromoText,
    PromoEventId,
    GuestVoucher,
    Voucher,
} from './checkout.types';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AddAddressComponent } from './add-address/add-address.component';
import { EditAddressComponent } from './edit-address/edit-address.component';
import { VoucherModalComponent } from './voucher-modal/voucher-modal.component';
import { AppConfig } from 'app/config/service.config';
import { MatSelect } from '@angular/material/select';
import { AnalyticService } from 'app/core/analytic/analytic.service';
import { IpAddressService } from 'app/core/ip-address/ip-address.service';
import { CookieService } from 'ngx-cookie-service';
import { GoogleMap } from '@angular/google-maps';

@Component({
    selector: 'landing-checkout',
    templateUrl: './checkout.component.html',
    styles: [
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

            ::ng-deep .mat-radio-button .mat-radio-ripple {
                display: none;
            }
            :host ::ng-deep .mat-radio-label-content {
                width: 100%;
            }

            :host ::ng-deep .mat-expansion-panel-body {
                padding: 0px;
            }

            :host
                ::ng-deep
                .mat-form-field.mat-form-field-appearance-fill.fuse-mat-dense
                .mat-form-field-wrapper
                .mat-form-field-flex {
                min-height: 42px;
            }
        `,
    ],
})
export class LandingCheckoutComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('checkoutNgForm') signInNgForm: NgForm;
    @ViewChild('checkoutContainer') checkoutContainer: ElementRef;

    @ViewChild('stateCitySelector') stateCitySelector: MatSelect;
    /** control for the selected bank for multi-selection */
    public regionCountryStateCities: FormControl = new FormControl();

    private _onDestroy = new Subject<void>();
    public filteredCities: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    storeStateCities: string[] = [];
    storeStateCities$: Observable<City[]>;

    checkoutForm: FormGroup;
    store: Store;
    user: User = null;
    storeSnooze: StoreSnooze = null;
    notificationMessage: string;
    daysArray = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
    ];
    storeTimings: { days: string[]; timing: string }[] = [];

    displayRedeem: boolean = false;

    cartItems: CartItem[] = [];
    order: Order;
    payment: Payment;

    ipAddress: string;
    ownerId: string;

    checkoutInputField: CheckoutInputField = new CheckoutInputField();

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
        cartGrandTotal: 0,
        voucherDeliveryDiscount: 0,
        voucherDeliveryDiscountDescription: null,
        voucherDiscountCalculationType: null,
        voucherDiscountCalculationValue: 0,
        voucherDiscountMaxAmount: 0,
        voucherDiscountType: null,
        voucherSubTotalDiscount: 0,
        voucherSubTotalDiscountDescription: null,
        storeVoucherDeliveryDiscount: null,
        storeVoucherDeliveryDiscountDescription: null,
        storeVoucherDiscountCalculationType: null,
        storeVoucherDiscountCalculationValue: null,
        storeVoucherDiscountMaxAmount: null,
        storeVoucherDiscountType: null,
        storeVoucherSubTotalDiscount: null,
        storeVoucherSubTotalDiscountDescription: null,
    };

    paymentCompletionStatus:
        | { id: 'CALCULATE_CHARGES'; label: 'Calculate Charges' }
        | { id: 'PLACE_ORDER'; label: 'Place Order' }
        | { id: 'ONLINE_PAY'; label: 'Pay Now' };

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
    showAddresses: boolean = false;
    customerAddresses: Address[] = [];
    defaultAddress: string = '';
    panelOpenState: boolean = false;
    dialingCode: string;

    // -------------------------
    // Voucher
    // -------------------------

    // Member Voucher
    customerVouchers: CustomerVoucher[] = [];
    customerVoucherPagination: CustomerVoucherPagination;

    usedCustomerVouchers: CustomerVoucher[] = [];
    usedCustomerVoucherPagination: UsedCustomerVoucherPagination;
    promoCode: string = '';
    voucherApplied: CustomerVoucher = null;
    voucherDiscountAppliedMax: number = 0;
    voucherDiscountApplied: number = 0;
    verticalList: VoucherVerticalList[] = [];

    // Guest Voucher
    guestVouchers: CustomerVoucher = null;

    // Promo
    promoText: PromoText;
    sanatiseUrl: string;
    promoActionButtonText: string = '';

    // Map
    countryId: String;
    isNameValid: boolean;
    lat: number = 30.3753;
    lng: number = 69.3451;
    markers: any;
    address: string;
    centerLatitude = this.lat;
    centerLongitude = this.lng;
    searchElementRef: any;

    mapsApiLoaded: Observable<boolean>;
    mapZoom: number = 6;
    mapCenter: google.maps.LatLngLiteral = {
        lat: 29.863823279065763,
        lng: 69.66914923422128,
    };
    mapOptions: google.maps.MapOptions = {
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        scaleControl: true,
    };

    marker: google.maps.Marker;
    markerPosition: object;
    markerLabel: object;

    geocoder: google.maps.Geocoder;
    mapSearchService: google.maps.places.AutocompleteService;
    addressSearchPredictions: google.maps.places.QueryAutocompletePrediction[];
    isAddressLoading: boolean = false;
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
        private _userService: UserService,
        private _apiServer: AppConfig,
        private _platformLocation: PlatformLocation,
        private _analyticService: AnalyticService,
        private _ipAddressService: IpAddressService,
        private _cookieService: CookieService,
        @Inject(DOCUMENT) private _document: Document,
        private httpClient: HttpClient,
        private ngZone: NgZone
    ) {
        this.mapsApiLoaded = httpClient
            .jsonp(
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyCFhf1LxbPWNQSDmxpfQlx69agW-I-xBIw&libraries=places',
                'callback'
            )
            .pipe(
                map(() => {
                    this.mapSearchService =
                        new google.maps.places.AutocompleteService();
                    this.geocoder = new google.maps.Geocoder();
                    return true;
                }),
                catchError(() => of(false))
            );
    }

    ngOnInit() {
        // Create the support form
        this.checkoutForm = this._formBuilder.group({
            // Main Store Section
            id: ['undefined'],
            fullName: ['', Validators.required],
            // firstName           : ['', Validators.required],
            // lastName            : ['', Validators.required],
            email: [
                '',
                [Validators.required, CheckoutValidationService.emailValidator],
            ],
            phoneNumber: [
                '',
                [
                    CheckoutValidationService.phonenumberValidator,
                    Validators.maxLength(30),
                ],
            ],
            address: ['', Validators.required],
            storePickup: [false],
            postCode: [
                '',
                [
                    Validators.required,
                    Validators.minLength(5),
                    Validators.maxLength(5),
                    CheckoutValidationService.postcodeValidator,
                ],
            ],
            state: ['', Validators.required],
            city: ['', Validators.required],
            deliveryProviderId: [
                '',
                CheckoutValidationService.deliveryProviderValidator,
            ],
            country: [''],
            regionCountryStateId: [''],
            specialInstruction: [''],
            saveMyInfo: [true],
            addresses: [],
            customerAddress: [''],
        });

        this.setInitialValue();

        // set initial selection
        this.regionCountryStateCities.setValue([]);
        // load the initial bank list
        // this.filteredCities.next(this.cities.slice());

        this.regionCountryStateCities.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe((result) => {
                // Get states by country Z(using symplified backend)
                this._storesService
                    .getStoreRegionCountryStateCity(
                        this.checkoutForm.get('state').value,
                        result,
                        this.store ? this.store.regionCountry.id : ''
                    )
                    .subscribe((response) => {
                        // Get the products
                        this.storeStateCities$ = this._storesService.cities$;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            });

        this.checkoutForm
            .get('state')
            .valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe((result) => {
                // Get states by country Z(using symplified backend)
                this._storesService
                    .getStoreRegionCountryStateCity(
                        result,
                        '',
                        this.store ? this.store.regionCountry.id : ''
                    )
                    .subscribe((response) => {
                        // Get the products
                        this.storeStateCities$ = this._storesService.cities$;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            });

        // Set Payment Completion Status "Calculate Charges"
        this.paymentCompletionStatus = {
            id: 'CALCULATE_CHARGES',
            label: 'Calculate Charges',
        };

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;

                this.checkoutForm.get('email').patchValue(user.email);
                this.checkoutForm.get('fullName').patchValue(user.name);
                // this.checkoutForm.get('phoneNumber').patchValue(user.);
                this.checkoutForm.get('id').patchValue(user.id);

                this.getCustomerAddresses(user);
            });

        let fullUrl = (this._platformLocation as any).location.origin;
        this.sanatiseUrl = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        // Get User IP Address
        this._ipAddressService.ipAdressInfo$.subscribe((response: any) => {
            if (response) {
                this.ipAddress = response.ip_addr;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        this.ownerId = this._cookieService.get('CustomerId');

        // --------------
        // Get store
        // --------------
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {
                this.store = response;

                // -------------------------
                // Set Dialing code and Coordinate
                // -------------------------

                this.countryId = this.store.regionCountry.id;


                let symplifiedCountryStateId =
                    this.checkoutForm.get('state').value;

                switch (this.countryId) {
                    case 'MYS':
                        this.dialingCode = '60';
                        this.checkoutForm.get('state').setValue('Selangor');
                        this.mapCenter = {
                            lat: 3.078101,
                            lng: 101.586527,
                        };
        
                        break;

                    case 'PAK':
                        this.dialingCode = '92';
                        this.checkoutForm.get('state').setValue('Federal');
                        this.mapCenter = {
                            lat: 29.863823279065763,
                            lng: 69.66914923422128,
                        };
        
                        break;

                    default:
                        break;
                }

                // -------------------------
                // Set Map For PK Store Only
                // -------------------------

                if (this.countryId === 'PAK') {
                }

                // -----------------------
                // Store Timings & Snooze
                // -----------------------

                // get store timings & snooze (for store closing)
                this._storesService.storeSnooze$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: StoreSnooze) => {
                        this.storeSnooze = response;

                        // check store timings
                        this.checkStoreTiming(
                            this.store.storeTiming,
                            this.storeSnooze
                        );

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // display store timing operating hour
                this.store.storeTiming.forEach((item) => {
                    let index = this.storeTimings.findIndex(
                        (element) =>
                            element.timing ===
                            item.openTime + ' - ' + item.closeTime
                    );
                    if (item.isOff === false) {
                        if (index > -1) {
                            this.storeTimings[index].days.push(item.day);
                        } else {
                            this.storeTimings.push({
                                days: [item.day],
                                timing: item.openTime + ' - ' + item.closeTime,
                            });
                        }
                    }
                });

                // -----------------------
                // Service Charges
                // -----------------------

                // service charges percentage
                this.paymentDetails.storeServiceChargePercentage =
                    this.store.serviceChargesPercentage;

                // Get subtotal discount
                this._checkoutService
                    .getSubTotalDiscount(this._cartService.cartId$)
                    .subscribe((response: CartDiscount) => {
                        // update for subtotal only
                        this.paymentDetails.subTotalDiscount =
                            response.subTotalDiscount;
                        this.paymentDetails.subTotalDiscountDescription =
                            response.subTotalDiscountDescription;
                        this.paymentDetails.cartSubTotal =
                            response.cartSubTotal;

                        this.paymentDetails.storeServiceChargePercentage =
                            response.storeServiceChargePercentage;
                        this.paymentDetails.storeServiceCharge =
                            response.storeServiceCharge;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // -----------------------
                // Store Country & States
                // -----------------------

                // set country
                this.checkoutForm
                    .get('country')
                    .patchValue(this.store.regionCountry.name);

                // Get store states
                this._storesService
                    .getStoreRegionCountryState(this.store.regionCountry.id)
                    .subscribe((response) => {
                        this.regionCountryStates = response;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get city by state
                this._storesService
                    .getStoreRegionCountryStateCity(symplifiedCountryStateId)
                    .subscribe((response) => {
                        // Get the products
                        this.storeStateCities$ = this._storesService.cities$;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // -----------------------
                // Get cart item
                // -----------------------

                this._cartService
                    .getCartItems(this._cartService.cartId$)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: CartItem[]) => {
                        this.cartItems = response;

                        if (this.cartItems && this.cartItems.length) {
                            let subTotalArr = this.cartItems.map((item) => {
                                return item.price;
                            });

                            // sum up the quantity in the array
                            this.paymentDetails.cartSubTotal =
                                subTotalArr.reduce((sum, a) => sum + a, 0);
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // ---------------------------
                // Get Store Delivery Details
                // ---------------------------

                this._storesService
                    .getStoreDeliveryDetails(this.store.id)
                    .subscribe((response) => {
                        this.allowsStorePickup = response.allowsStorePickup;
                    });

                // ----------------------
                // Voucher
                // ----------------------

                // Get used customer voucher
                this._checkoutService
                    .getAvailableCustomerVoucher(false, this.store.verticalCode)
                    .subscribe((response: any) => {
                        this.customerVouchers = response;

                        let index = this.customerVouchers.findIndex(
                            (x) => x.voucher.isNewUserVoucher === true
                        );
                        // select the voucher if it is new user voucher
                        if (index > -1) {
                            this.selectVoucher(this.customerVouchers[index]);
                            // this.calculateCharges();
                        }
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get customer voucher pagination, isUsed = false
                this._checkoutService.customerVoucherPagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: CustomerVoucherPagination) => {
                        this.customerVoucherPagination = response;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get used customer voucher pagination, isUsed = true
                this._checkoutService.usedCustomerVoucherPagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: UsedCustomerVoucherPagination) => {
                        this.usedCustomerVoucherPagination = response;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // For now, only get promo text if guest
                if (!this.user) {
                    this.promoActionButtonText = 'Sign Up Now';
                    this._checkoutService
                        .getPromoTextByEventId(
                            this.user
                                ? PromoEventId.Customer
                                : PromoEventId.Guest,
                            this.store.verticalCode
                        )
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((promoText: PromoText) => {
                            this.promoText = promoText;
                        });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // auto calculate charges
        (
            this.checkoutForm.get('state').valueChanges &&
            this.checkoutForm.get('city').valueChanges &&
            this.checkoutForm.get('postCode').valueChanges &&
            this.checkoutForm.get('address').valueChanges
        )
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap(() => {
                    // set loading to true
                    // this.isLoading = true;

                    // this is when user is logged in and the checkoutForm is valid
                    // auto calculate charges
                    if (
                        this.user &&
                        this.checkoutForm.valid &&
                        this.cartItems.length > 0
                    ) {
                        this.calculateCharges();
                    }

                    return of(true);
                }),
                map(() => {
                    // set loading to false
                    // this.isLoading = false;
                })
            )
            .subscribe();

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.currentScreenSize = matchingAliases;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    updateQuantity(
        cartItem: CartItem,
        quantity: number,
        operator: string = null
    ) {
        if (operator === 'decrement')
            quantity > this.minQuantity
                ? quantity--
                : (quantity = this.minQuantity);
        else if (operator === 'increment')
            quantity < this.maxQuantity
                ? quantity++
                : (quantity = this.maxQuantity);
        else {
            if (quantity < this.minQuantity) quantity = this.minQuantity;
            else if (quantity > this.maxQuantity) quantity = this.maxQuantity;
        }

        const cartItemBody = {
            cartId: cartItem.cartId,
            id: cartItem.id,
            itemCode: cartItem.itemCode,
            productId: cartItem.productId,
            quantity: quantity,
        };

        if (
            !(
                cartItem.quantity === quantity &&
                (quantity === this.minQuantity || quantity === this.maxQuantity)
            )
        ) {
            this._cartService
                .putCartItem(
                    this._cartService.cartId$,
                    cartItemBody,
                    cartItem.id
                )
                .subscribe((response) => {
                    const voucherCode = {
                        platformVoucher:
                            this.voucherApplied &&
                            this.voucherApplied.voucher.voucherType ===
                                'PLATFORM'
                                ? this.voucherApplied.voucher.voucherCode
                                : null,
                        storeVoucher:
                            this.voucherApplied &&
                            this.voucherApplied.voucher.voucherType === 'STORE'
                                ? this.voucherApplied.voucher.voucherCode
                                : null,
                    };

                    let discountParams = {
                        id: this._cartService.cartId$,
                        deliveryQuotationId:
                            this.selectedDeliveryProvider?.refId,
                        deliveryType:
                            this.selectedDeliveryProvider?.deliveryType,
                        voucherCode: voucherCode.platformVoucher,
                        storeVoucherCode: voucherCode.storeVoucher,
                        customerId: this.user ? this.user.id : null,
                        email: this.user
                            ? null
                            : this.checkoutForm.get('email').value,
                        storeId: this.store.id
                    };
                    // recheck the getDiscountOfCart
                    this._checkoutService
                        .getDiscountOfCart(discountParams)
                        .subscribe(
                            (response) => {
                                this.paymentDetails = {
                                    ...this.paymentDetails,
                                    ...response,
                                };

                                // this.addressFormChanges();
                            },
                            (error) => {
                                // Set Payment Completion Status "Calculate Charges"
                                this.paymentCompletionStatus = {
                                    id: 'CALCULATE_CHARGES',
                                    label: 'Calculate Charges',
                                };
                            }
                        );
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    deleteCartItem(cartItem: CartItem) {
        //To make custom pop up, and we pass the details in paramter data
        let dialogRef = this._dialog.open(
            ModalConfirmationDeleteItemComponent,
            {
                disableClose: true,
                data: {
                    cartId: this._cartService.cartId$,
                    itemId: cartItem.id,
                },
            }
        );
        dialogRef.afterClosed().subscribe((result) => {
            // if cart has items, calculate the charges
            if (this.cartItems.length > 0) {
                this.calculateCharges();
            }
            // if cart is empty, reset the values
            else {
                // change button to Calculate Charges
                this.addressFormChanges();
            }
        });
    }

    allowPickupStore() {
        this.checkoutForm
            .get('storePickup')
            .setValue(this.checkoutForm.get('storePickup').value);
    }

    goBack() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    displayError(message: string) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Error',
            message: message,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'OK',
                    color: 'warn',
                },
                cancel: {
                    show: false,
                    label: 'Cancel',
                },
            },
            dismissible: true,
        });

        return confirmation;
    }

    addressFormChanges() {
        if (this.checkoutForm.get('storePickup').value === true) {
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
        this.paymentCompletionStatus = {
            id: 'CALCULATE_CHARGES',
            label: 'Calculate Charges',
        };

        // Set back voucher related field to 0
        this.paymentDetails.voucherSubTotalDiscount = 0;
        this.paymentDetails.voucherDeliveryDiscount = 0;
        this.paymentDetails.storeVoucherSubTotalDiscount = 0;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    sanitizePhoneNumber(phoneNumber: string) {
        if (phoneNumber.match(/^\+?[0-9]+$/)) {
            let substring = phoneNumber.substring(0, 1);
            let countryId = this.store.regionCountry.id;
            let sanitizedPhoneNo = '';

            if (countryId === 'MYS') {
                if (substring === '6') sanitizedPhoneNo = phoneNumber;
                else if (substring === '0')
                    sanitizedPhoneNo = '6' + phoneNumber;
                else if (substring === '+')
                    sanitizedPhoneNo = phoneNumber.substring(1);
                else sanitizedPhoneNo = '60' + phoneNumber;
            } else if (countryId === 'PAK') {
                if (substring === '9') sanitizedPhoneNo = phoneNumber;
                else if (substring === '2')
                    sanitizedPhoneNo = '9' + phoneNumber;
                else if (substring === '+')
                    sanitizedPhoneNo = phoneNumber.substring(1);
                else sanitizedPhoneNo = '92' + phoneNumber;
            }

            return sanitizedPhoneNo;
        } else {
            return phoneNumber;
        }
    }

    checkCustomerInfo(type: string, data: string) {
        const email = type === 'email' ? data : null;
        let phoneNumber = type === 'phoneNumber' ? data : null;

        // phone number sanitization
        if (type === 'phoneNumber') {
            phoneNumber = this.sanitizePhoneNumber(phoneNumber);
            this.checkoutForm.get('phoneNumber').patchValue(phoneNumber);

            // if type phone number and self pickup, just sanitize it and dont call getCustomerInfo
            if (this.checkoutForm.get('storePickup').value === true) return;
        }

        this._checkoutService
            .getCustomerInfo(email, phoneNumber)
            .subscribe((response) => {
                if (response && response.customerAddress.length > 0) {
                    let dialogRef = this._dialog.open(
                        ChooseDeliveryAddressComponent,
                        { disableClose: true, data: response }
                    );
                    dialogRef.afterClosed().subscribe((result) => {
                        if (result.isAddress === true) {
                            this.checkoutForm.get('id').patchValue(response.id);
                            this.checkoutForm
                                .get('fullName')
                                .patchValue(response.name);
                            if (type === 'email')
                                this.checkoutForm
                                    .get('email')
                                    .patchValue(response.email);
                            if (type === 'phoneNumber')
                                this.checkoutForm
                                    .get('phoneNumber')
                                    .patchValue(response.phoneNumber);

                            this.checkoutForm
                                .get('address')
                                .patchValue(result.address);
                            this.checkoutForm
                                .get('postCode')
                                .patchValue(result.postCode.trim());
                            this.checkoutForm
                                .get('state')
                                .patchValue(result.state);
                            this.checkoutForm
                                .get('city')
                                .patchValue(result.city);
                            this.checkoutForm
                                .get('country')
                                .patchValue(result.country);
                        }
                    });
                }
            });
    }

    executeAction(paymentCompletionStatusId) {
        if (paymentCompletionStatusId === 'CALCULATE_CHARGES') {
            this.calculateCharges();
        } else if (paymentCompletionStatusId === 'PLACE_ORDER') {
            this.cashOnDeliveryPay();
        } else if (paymentCompletionStatusId === 'ONLINE_PAY') {
            this.onlinePay();
        } else {
            console.error('Invalid Payment Completion Status');
        }
    }

    copyFormControl(control: AbstractControl) {
        if (control instanceof FormControl) {
            return new FormControl(control.value);
        } else if (control instanceof FormGroup) {
            const copy = new FormGroup({});
            Object.keys(control.controls).forEach((key) => {
                copy.addControl(
                    key,
                    this.copyFormControl(control.controls[key])
                );
            });
            return copy;
        } else if (control instanceof FormArray) {
            const copy = new FormArray([]);
            control.controls.forEach((control) => {
                copy.push(this.copyFormControl(control));
            });
            return copy;
        }
    }

    calculateCharges() {
        // Set Loading to true
        this.isCalculating = true;
        this.isLoading = true;

        if (
            this.checkoutForm.get('storePickup').value === false &&
            this.checkoutForm.get('customerAddress').value === '' &&
            this.user
        ) {
            this.displayError('Address is empty');
            // Set Loading to false
            this.isCalculating = false;
            this.isLoading = false;
            return;
        }

        // Do nothing if the form is invalid
        let BreakException = {};
        try {
            Object.keys(this.checkoutForm.controls).forEach((key) => {
                const controlErrors: ValidationErrors =
                    this.checkoutForm.get(key).errors;
                if (controlErrors != null) {
                    Object.keys(controlErrors).forEach((keyError) => {
                        const checkoutFormInfo = this.checkoutForm.get(key);
                        checkoutFormInfo['info'] = this.checkoutInputField[key];

                        this.displayError(
                            'Please fill in the required field(s)'
                        );
                        // this.displayError(CheckoutValidationService.getValidatorErrorMessage(keyError, checkoutFormInfo));
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

        // do nothing if cart is empty and show popup error
        if (this.cartItems.length < 1) {
            // Set Loading to false
            this.isCalculating = false;
            this.isLoading = false;
            this.displayError('Cart is empty');

            return;
        }

        // reset selectedDeliveryProvider
        this.selectedDeliveryProvider = null;
        this.checkoutForm.get('deliveryProviderId').patchValue(null);

        // retrieveDeliveryCharges if not store pickup
        if (this.checkoutForm.get('storePickup').value === false) {
            let _selectedStateIndex = this.regionCountryStates.findIndex(
                (item) => item.id === this.checkoutForm.get('state').value
            );
            let countryId = this.store.regionCountry.id;

            const deliveryChargesBody = {
                cartId: this._cartService.cartId$,
                customerId: this.checkoutForm.get('id').value,
                delivery: {
                    deliveryAddress: this.checkoutForm.get('address').value,
                    deliveryCity: this.checkoutForm.get('city').value,
                    deliveryState:
                        _selectedStateIndex > -1
                            ? this.regionCountryStates[_selectedStateIndex].name
                            : this.checkoutForm.get('state').value,
                    deliveryPostcode: this.checkoutForm.get('postCode').value,
                    deliveryCountry: this.checkoutForm.get('country').value,
                    deliveryContactEmail: this.checkoutForm.get('email').value,
                    deliveryContactName:
                        this.checkoutForm.get('fullName').value,
                    deliveryContactPhone:
                        this.checkoutForm.get('phoneNumber').value,
                    latitude: this.lat,
                    longitude: this.lng,
                },
                deliveryProviderId: null,
                storeId: this._storesService.storeId$,
            };

            this._checkoutService
                .postToRetrieveDeliveryCharges(deliveryChargesBody)
                .subscribe((deliveryProviderResponse: DeliveryProvider[]) => {
                    if (deliveryProviderResponse.length === 0) {
                        // if there's no delivery provider, display error
                        this.displayError('No available delivery provider');
                        console.error('No available delivery provider');
                    } else if (deliveryProviderResponse.length === 1) {
                        // load the delivery providers
                        this.deliveryProviders = deliveryProviderResponse;

                        // load the delivery providers group (for E-Commerce)
                        this.deliveryProvidersGroup = [];
                        this.deliveryProvidersGroup.push({
                            providerId: deliveryProviderResponse[0].providerId,
                            deliveryProviders: [deliveryProviderResponse[0]],
                        });

                        // if there's 1 delivery provider, load the delivery provider to mat-select
                        this.checkoutForm
                            .get('deliveryProviderId')
                            .patchValue(this.deliveryProviders[0].providerId);

                        // load selected delivery provider
                        this.selectedDeliveryProvider =
                            this.deliveryProviders[0];

                        // load selected delivery provider group
                        this.selectedDeliveryProvidersGroup =
                            this.deliveryProvidersGroup[0];

                        // find delivery with no error
                        let index =
                            this.selectedDeliveryProvidersGroup.deliveryProviders.findIndex(
                                (item) => item.isError === false
                            );

                        if (index > -1) {
                            this.checkedDeliveryRefId =
                                this.selectedDeliveryProvidersGroup.deliveryProviders[
                                    index
                                ].refId;
                        }

                        if (this.selectedDeliveryProvider.isError === true) {
                            let confirmation = this.displayError(
                                this.selectedDeliveryProvider.providerName +
                                    ' error: ' +
                                    this.selectedDeliveryProvider.message
                            );

                            confirmation.afterClosed().subscribe((result) => {
                                // reset selectedDeliveryProvider
                                this.selectedDeliveryProvider = null;
                                this.checkoutForm
                                    .get('deliveryProviderId')
                                    .patchValue(null);
                            });
                        } else {
                            const voucherCode = {
                                platformVoucher:
                                    this.voucherApplied &&
                                    this.voucherApplied.voucher.voucherType ===
                                        'PLATFORM'
                                        ? this.voucherApplied.voucher
                                              .voucherCode
                                        : null,
                                storeVoucher:
                                    this.voucherApplied &&
                                    this.voucherApplied.voucher.voucherType ===
                                        'STORE'
                                        ? this.voucherApplied.voucher
                                              .voucherCode
                                        : null,
                            };

                            let discountParams = {
                                id: this._cartService.cartId$,
                                deliveryQuotationId:
                                    this.selectedDeliveryProvider?.refId,
                                deliveryType:
                                    this.selectedDeliveryProvider?.deliveryType,
                                voucherCode: voucherCode.platformVoucher,
                                storeVoucherCode: voucherCode.storeVoucher,
                                customerId: this.user ? this.user.id : null,
                                email: this.user
                                    ? null
                                    : this.checkoutForm.get('email').value,
                                storeId: this.store.id
                            };

                            // get getDiscountOfCart
                            this._checkoutService
                                .getDiscountOfCart(discountParams)
                                .subscribe(
                                    (response) => {
                                        this.paymentDetails = {
                                            ...this.paymentDetails,
                                            ...response,
                                        };
                                    },
                                    (error) => {
                                        // Set Payment Completion Status "Calculate Charges"
                                        this.paymentCompletionStatus = {
                                            id: 'CALCULATE_CHARGES',
                                            label: 'Calculate Charges',
                                        };

                                        if (
                                            error['status'] === 417 &&
                                            this.voucherApplied
                                        ) {
                                            if (error.error.message) {
                                                // this.openVoucherModal('heroicons_outline:exclamation-circle','Oops!', error.error.message, null, true);
                                                this.voucherApplied = null;
                                            }
                                        }
                                    }
                                );

                            // set price (this is based on delivery service api getPrice)
                            this.paymentDetails.deliveryCharges =
                                this.selectedDeliveryProvider.price;

                            if (this.store.paymentType === 'ONLINEPAYMENT') {
                                // change text to placeorder OR paynow
                                this.paymentCompletionStatus = {
                                    id: 'ONLINE_PAY',
                                    label: 'Pay Now',
                                };
                            } else if (this.store.paymentType === 'COD') {
                                // change text to placeorder OR paynow
                                this.paymentCompletionStatus = {
                                    id: 'PLACE_ORDER',
                                    label: 'Place Order',
                                };
                            }
                        }
                    } else {
                        // sort and categoried the delivery providers
                        this.deliveryProvidersGroup = [];
                        deliveryProviderResponse.forEach((item) => {
                            if (this.deliveryProvidersGroup.length < 1) {
                                this.deliveryProvidersGroup.push({
                                    providerId: item.providerId,
                                    deliveryProviders: [item],
                                });
                            } else {
                                // find the same providerId
                                let index =
                                    this.deliveryProvidersGroup.findIndex(
                                        (element) =>
                                            element.providerId ===
                                            item.providerId
                                    );

                                if (index > -1) {
                                    this.deliveryProvidersGroup[
                                        index
                                    ].deliveryProviders.push(item);
                                } else {
                                    this.deliveryProvidersGroup.push({
                                        providerId: item.providerId,
                                        deliveryProviders: [item],
                                    });
                                }
                            }
                        });

                        // load all delivery provider in mat-select without default provider
                        this.deliveryProviders = deliveryProviderResponse;
                    }

                    // Set Loading to false
                    this.isCalculating = false;
                    this.isLoading = false;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            const voucherCode = {
                platformVoucher:
                    this.voucherApplied &&
                    this.voucherApplied.voucher.voucherType === 'PLATFORM'
                        ? this.voucherApplied.voucher.voucherCode
                        : null,
                storeVoucher:
                    this.voucherApplied &&
                    this.voucherApplied.voucher.voucherType === 'STORE'
                        ? this.voucherApplied.voucher.voucherCode
                        : null,
            };

            let discountParams = {
                id: this._cartService.cartId$,
                deliveryQuotationId: null,
                deliveryType: 'PICKUP',
                voucherCode: voucherCode.platformVoucher,
                storeVoucherCode: voucherCode.storeVoucher,
                customerId: this.user ? this.user.id : null,
                email: this.user ? null : this.checkoutForm.get('email').value,
                storeId: this.store.id
            };
            // Get discount for store pickup
            this._checkoutService.getDiscountOfCart(discountParams).subscribe(
                (response) => {
                    this.paymentDetails = {
                        ...this.paymentDetails,
                        ...response,
                    };

                    if (this.store.paymentType === 'ONLINEPAYMENT') {
                        // change text to placeorder OR paynow
                        this.paymentCompletionStatus = {
                            id: 'ONLINE_PAY',
                            label: 'Pay Now',
                        };
                    } else if (this.store.paymentType === 'COD') {
                        // change text to placeorder OR paynow
                        this.paymentCompletionStatus = {
                            id: 'PLACE_ORDER',
                            label: 'Place Order',
                        };
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                },
                (error) => {
                    // Set Payment Completion Status "Calculate Charges"
                    this.paymentCompletionStatus = {
                        id: 'CALCULATE_CHARGES',
                        label: 'Calculate Charges',
                    };

                    if (error['status'] === 409 && this.voucherApplied) {
                        this.voucherApplied = null;

                        if (error.error.message) {
                            this.openVoucherModal(
                                'heroicons_outline:x',
                                'Error',
                                error.error.message,
                                null,
                                true
                            );
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }
                }
            );

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
    changeDeliveryProvider(
        deliveryProviderId: string,
        deliveryProviderGroupType: string = null
    ) {
        if (this.store.verticalCode === 'E-Commerce') {
            if (deliveryProviderGroupType === null) {
                this.selectedDeliveryProvidersGroup =
                    this.deliveryProvidersGroup.find(
                        (item) => item.providerId === deliveryProviderId
                    );
                // this is only to set the selectedDeliveryProvidersGroup,
                // not getting the price yet

                // find delivery with no error
                let index =
                    this.selectedDeliveryProvidersGroup.deliveryProviders.findIndex(
                        (item) => item.isError === false
                    );

                if (index > -1) {
                    this.checkedDeliveryRefId =
                        this.selectedDeliveryProvidersGroup.deliveryProviders[
                            index
                        ].refId;

                    // this to allow first selected delivery service calculate its price
                    deliveryProviderId = this.checkedDeliveryRefId;
                    deliveryProviderGroupType = 'group';
                } else {
                    let confirmation = this.displayError(
                        this.selectedDeliveryProvidersGroup.deliveryProviders[0]
                            .providerName +
                            ' error: ' +
                            this.selectedDeliveryProvidersGroup
                                .deliveryProviders[0].message
                    );

                    confirmation.afterClosed().subscribe((result) => {
                        // reset selectedDeliveryProvider
                        this.selectedDeliveryProvider = null;

                        // set selectedDeliveryProvidersGroup to null
                        this.selectedDeliveryProvidersGroup = null;

                        // Set back delivery charges & grand total to 0
                        this.paymentDetails.deliveryCharges = 0;
                        this.paymentDetails.deliveryDiscount = 0;
                        this.paymentDetails.cartGrandTotal = 0;

                        this.checkoutForm
                            .get('deliveryProviderId')
                            .patchValue(null);

                        // Set Payment Completion Status "Calculate Charges"
                        this.paymentCompletionStatus = {
                            id: 'CALCULATE_CHARGES',
                            label: 'Calculate Charges',
                        };
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
        if (deliveryProviderGroupType === 'group') {
            // for group, we'll search based on refId
            index = this.deliveryProviders.findIndex(
                (item) =>
                    item.refId === deliveryProviderId && item.isError === false
            );
        } else {
            index = this.deliveryProviders.findIndex(
                (item) => item.providerId === deliveryProviderId
            );
        }

        if (index > -1) {
            this.checkoutForm
                .get('deliveryProviderId')
                .patchValue(this.deliveryProviders[index].providerId);

            // set selected delivery provider
            this.selectedDeliveryProvider = this.deliveryProviders[index];

            if (this.selectedDeliveryProvider.isError === true) {
                // for this.store.verticalCode !== 'E-Commerce or deliveryProviderGroupType === group ... no need to popup since
                // we don't show the radio button for user to select
                if (this.store.verticalCode !== 'E-Commerce') {
                    let confirmation = this.displayError(
                        this.selectedDeliveryProvider.providerName +
                            ' error: ' +
                            this.selectedDeliveryProvider.message
                    );

                    confirmation.afterClosed().subscribe((result) => {
                        // reset selectedDeliveryProvider
                        this.selectedDeliveryProvider = null;
                        this.checkoutForm
                            .get('deliveryProviderId')
                            .patchValue(null);

                        // set selectedDeliveryProvidersGroup to null
                        this.selectedDeliveryProvidersGroup = null;

                        // Set back delivery charges & grand total to 0
                        this.paymentDetails.deliveryCharges = 0;
                        this.paymentDetails.deliveryDiscount = 0;
                        this.paymentDetails.cartGrandTotal = 0;

                        // Set Payment Completion Status "Calculate Charges"
                        this.paymentCompletionStatus = {
                            id: 'CALCULATE_CHARGES',
                            label: 'Calculate Charges',
                        };
                    });
                }
            } else {
                const voucherCode = {
                    platformVoucher:
                        this.voucherApplied &&
                        this.voucherApplied.voucher.voucherType === 'PLATFORM'
                            ? this.voucherApplied.voucher.voucherCode
                            : null,
                    storeVoucher:
                        this.voucherApplied &&
                        this.voucherApplied.voucher.voucherType === 'STORE'
                            ? this.voucherApplied.voucher.voucherCode
                            : null,
                };

                let discountParams = {
                    id: this._cartService.cartId$,
                    deliveryQuotationId: null,
                    deliveryType: 'PICKUP',
                    voucherCode: voucherCode.platformVoucher,
                    storeVoucherCode: voucherCode.storeVoucher,
                    customerId: this.user ? this.user.id : null,
                    email: this.user
                        ? null
                        : this.checkoutForm.get('email').value,
                    storeId: this.store.id
                };

                this._checkoutService
                    .getDiscountOfCart(discountParams)
                    .subscribe(
                        (response: CartDiscount) => {
                            this.paymentDetails = {
                                ...this.paymentDetails,
                                ...response,
                            };

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        },
                        (error) => {
                            // Set Payment Completion Status "Calculate Charges"
                            this.paymentCompletionStatus = {
                                id: 'CALCULATE_CHARGES',
                                label: 'Calculate Charges',
                            };
                        }
                    );

                // set price (this is based on delivery service api getPrice)
                this.paymentDetails.deliveryCharges =
                    this.selectedDeliveryProvider.price;

                if (this.store.paymentType === 'ONLINEPAYMENT') {
                    // change text to placeorder OR paynow
                    this.paymentCompletionStatus = {
                        id: 'ONLINE_PAY',
                        label: 'Pay Now',
                    };
                } else if (this.store.paymentType === 'COD') {
                    // change text to placeorder OR paynow
                    this.paymentCompletionStatus = {
                        id: 'PLACE_ORDER',
                        label: 'Place Order',
                    };
                }
            }
        } else {
            console.error('Invalid Delivery Provider');
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    onlinePay() {
        // Set Loading to true
        this.isLoading = true;

        const voucherCode = {
            platformVoucher:
                this.voucherApplied &&
                this.voucherApplied.voucher.voucherType === 'PLATFORM'
                    ? this.voucherApplied.voucher.voucherCode
                    : null,
            storeVoucher:
                this.voucherApplied &&
                this.voucherApplied.voucher.voucherType === 'STORE'
                    ? this.voucherApplied.voucher.voucherCode
                    : null,
        };

        const orderBody = {
            cartId: this._cartService.cartId$,
            customerId: this.checkoutForm.get('id').value,
            customerNotes: this.checkoutForm.get('specialInstruction').value,
            voucherCode: voucherCode.platformVoucher,
            storeVoucherCode: voucherCode.storeVoucher,
            orderPaymentDetails: {
                accountName: this.checkoutForm.get('fullName').value, // ni mace saloh
                deliveryQuotationReferenceId:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.refId
                        : null, // deliveryQuotationReferenceId not needed if it's a store pickup
            },
            orderShipmentDetails: {
                address: this.checkoutForm.get('address').value,
                city: this.checkoutForm.get('city').value,
                country: this.checkoutForm.get('country').value,
                email: this.checkoutForm.get('email').value,
                phoneNumber: this.checkoutForm.get('phoneNumber').value,
                receiverName: this.checkoutForm.get('fullName').value,
                state: this.checkoutForm.get('state').value,
                storePickup: this.checkoutForm.get('storePickup').value,
                zipcode: this.checkoutForm.get('postCode').value,
                deliveryProviderId:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.providerId
                        : null, // deliveryProviderId not needed if it's a store pickup
                deliveryType:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.deliveryType
                        : 'PICKUP', // deliveryType is "PICKUP" if it's a store pickup
            },
        };

        this._checkoutService
            .postPlaceOrder(
                this._cartService.cartId$,
                orderBody,
                this.checkoutForm.get('saveMyInfo').value
            )
            .subscribe(
                (response) => {
                    this.order = response;

                    let dateTime = new Date();
                    let transactionId = this._datePipe.transform(
                        dateTime,
                        'yyyyMMddhhmmss'
                    );
                    let dateTimeNow = this._datePipe.transform(
                        dateTime,
                        'yyyy-MM-dd hh:mm:ss'
                    ); //2022-05-18 09:51:36

                    const paymentBody = {
                        // callbackUrl: "https://bon-appetit.symplified.ai/thankyou",
                        customerId: this.checkoutForm.get('id').value,
                        customerName: this.checkoutForm.get('fullName').value,
                        // paymentAmount: this.paymentDetails.cartGrandTotal.toFixed(2),
                        productCode: 'parcel', //
                        storeName: this.store.name,
                        systemTransactionId: transactionId,
                        transactionId: this.order.id,
                    };

                    this._checkoutService
                        .postMakePayment(paymentBody)
                        .subscribe(
                            (response) => {
                                this.payment = response;

                                if (this.payment.isSuccess === true) {
                                    if (this.payment.providerId == '1') {
                                        window.location.href =
                                            this.payment.paymentLink;
                                    } else if (this.payment.providerId == '2') {
                                        this.postForm(
                                            'post-to-senangpay',
                                            this.payment.paymentLink,
                                            {
                                                detail: this.payment
                                                    .sysTransactionId,
                                                amount: this.paymentDetails.cartGrandTotal.toFixed(
                                                    2
                                                ),
                                                order_id: this.order.id,
                                                name: this.order
                                                    .orderShipmentDetail
                                                    .receiverName,
                                                email: this.order
                                                    .orderShipmentDetail.email,
                                                phone: this.order
                                                    .orderShipmentDetail
                                                    .phoneNumber,
                                                hash: this.payment.hash,
                                            },
                                            'post',
                                            true
                                        );
                                    } else if (this.payment.providerId == '3') {
                                        this.postForm(
                                            'post-to-fastpay',
                                            this.payment.paymentLink,
                                            {
                                                CURRENCY_CODE: 'PKR',
                                                MERCHANT_ID: '13464',
                                                MERCHANT_NAME:
                                                    'EasyDukan Pvt Ltd',
                                                TOKEN: this.payment.token,
                                                SUCCESS_URL:
                                                    this._apiServer.settings
                                                        .apiServer
                                                        .paymentService +
                                                    '/payments/payment-redirect?name=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .receiverName +
                                                    '&email=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .email +
                                                    '&phone=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .phoneNumber +
                                                    '&amount=' +
                                                    this.paymentDetails.cartGrandTotal.toFixed(
                                                        2
                                                    ) +
                                                    '&hash=' +
                                                    this.payment.hash +
                                                    '&status_id=1' +
                                                    '&order_id=' +
                                                    this.order.id +
                                                    '&transaction_id=' +
                                                    transactionId +
                                                    '&msg=Payment_was_successful&payment_channel=fastpay',
                                                FAILURE_URL:
                                                    this._apiServer.settings
                                                        .apiServer
                                                        .paymentService +
                                                    '/payments/payment-redirect?name=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .receiverName +
                                                    '&email=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .email +
                                                    '&phone=' +
                                                    this.order
                                                        .orderShipmentDetail
                                                        .phoneNumber +
                                                    '&amount=' +
                                                    this.paymentDetails.cartGrandTotal.toFixed(
                                                        2
                                                    ) +
                                                    '&hash=' +
                                                    this.payment.hash +
                                                    '&status_id=0' +
                                                    '&order_id=' +
                                                    this.order.id +
                                                    '&transaction_id=' +
                                                    transactionId +
                                                    '&msg=Payment_was_failed&payment_channel=fastpay',
                                                CHECKOUT_URL:
                                                    this.store.domain +
                                                    '/checkout',
                                                CUSTOMER_EMAIL_ADDRESS:
                                                    this.order
                                                        .orderShipmentDetail
                                                        .email,
                                                CUSTOMER_MOBILE_NO:
                                                    this.order
                                                        .orderShipmentDetail
                                                        .phoneNumber,
                                                TXNAMT: this.paymentDetails.cartGrandTotal.toFixed(
                                                    2
                                                ),
                                                BASKET_ID:
                                                    this.payment
                                                        .sysTransactionId,
                                                ORDER_DATE: dateTimeNow,
                                                SIGNATURE: 'SOME-RANDOM-STRING',
                                                VERSION: 'MERCHANT-CART-0.1',
                                                TXNDESC:
                                                    'Item purchased from EasyDukan',
                                                PROCCODE: '00',
                                                TRAN_TYPE: 'ECOMM_PURCHASE',
                                                STORE_ID: '',
                                            },
                                            'post',
                                            false
                                        );
                                    } else {
                                        this.displayError(
                                            'Provider id not configured'
                                        );
                                        console.error(
                                            'Provider id not configured'
                                        );
                                    }
                                }
                                // Set Loading to false
                                this.isLoading = false;
                            },
                            (error) => {
                                // Set Loading to false
                                this.isLoading = false;
                            }
                        );
                },
                (error) => {
                    // Set Loading to false
                    this.isLoading = false;
                }
            );
    }

    cashOnDeliveryPay() {
        // Set Loading to true
        this.isLoading = true;

        const voucherCode = {
            platformVoucher:
                this.voucherApplied &&
                this.voucherApplied.voucher.voucherType === 'PLATFORM'
                    ? this.voucherApplied.voucher.voucherCode
                    : null,
            storeVoucher:
                this.voucherApplied &&
                this.voucherApplied.voucher.voucherType === 'STORE'
                    ? this.voucherApplied.voucher.voucherCode
                    : null,
        };

        const orderBody = {
            cartId: this._cartService.cartId$,
            customerId: this.checkoutForm.get('id').value,
            customerNotes: this.checkoutForm.get('specialInstruction').value,
            voucherCode: voucherCode.platformVoucher,
            storeVoucherCode: voucherCode.storeVoucher,
            orderPaymentDetails: {
                accountName: this.checkoutForm.get('fullName').value, // ni mace saloh
                deliveryQuotationReferenceId:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.refId
                        : null, // deliveryQuotationReferenceId not needed if it's a store pickup
            },
            orderShipmentDetails: {
                address: this.checkoutForm.get('address').value,
                city: this.checkoutForm.get('city').value,
                country: this.checkoutForm.get('country').value,
                email: this.checkoutForm.get('email').value,
                phoneNumber: this.checkoutForm.get('phoneNumber').value,
                receiverName: this.checkoutForm.get('fullName').value,
                state: this.checkoutForm.get('state').value,
                storePickup: this.checkoutForm.get('storePickup').value,
                zipcode: this.checkoutForm.get('postCode').value,
                deliveryProviderId:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.providerId
                        : null, // deliveryProviderId not needed if it's a store pickup
                deliveryType:
                    this.checkoutForm.get('storePickup').value === false
                        ? this.selectedDeliveryProvider.deliveryType
                        : 'PICKUP', // deliveryType is "PICKUP" if it's a store pickup
            },
        };
        this._checkoutService
            .postPlaceOrder(
                this._cartService.cartId$,
                orderBody,
                this.checkoutForm.get('saveMyInfo').value
            )
            .subscribe(
                (response) => {
                    // after success set the cartItem to empty array
                    this.cartItems = [];
                    // set in cart service
                    this._cartService.cartItems = this.cartItems;

                    this._router.navigate([
                        'thankyou/SUCCESS/COD/ORDER_CONFIRMED',
                    ]);
                },
                (error) => {
                    // Set Loading to false
                    this.isLoading = false;
                }
            );
    }

    postForm(id, path, params, method, encode: boolean) {
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
                hiddenField.setAttribute(
                    'value',
                    encode ? encodeURI(params[key]) : params[key]
                );

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();

        //get ip address info
        var _IpService = this.ipAddress;

        var _sessionId = this._cartService.cartId$;

        this._analyticService
            .postActivity({
                browserType: null,
                customerId: this.ownerId ? this.ownerId : null,
                deviceModel: null,
                errorOccur: null,
                errorType: null,
                ip: _IpService,
                os: null,
                pageVisited: path,
                sessionId: _sessionId,
                storeId: null,
            })
            .subscribe((response) => {});
    }

    scrollToTop(el) {
        var to = 0;
        var duration = 1000;
        var start = el.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;

        var easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        var animateScroll = function () {
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);

            el.scrollTop = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start',
                });
            }
        };
        animateScroll();
    }

    scrollToLeft(el) {
        var to = 0;
        var duration = 600;
        var start = el.scrollLeft,
            change = to - start,
            currentTime = 0,
            increment = 20;

        var easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        var animateScroll = function () {
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);

            el.scrollLeft = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start',
                });
            }
        };
        animateScroll();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    getCustomerAddresses(user) {
        // Get customer Addresses
        this._userService
            .getCustomerAddress(user.id)
            .subscribe((response: any) => {
                if (response.length > 0) {
                    //sort isDefault true first
                    this.customerAddresses = response.sort(
                        (a, b) => Number(b.isDefault) - Number(a.isDefault)
                    );

                    let index = this.customerAddresses.findIndex(
                        (element) => element.isDefault === true
                    );

                    if (index > -1) {
                        this.defaultAddress = this.customerAddresses[index].id;
                        this.checkoutForm
                            .get('customerAddress')
                            .patchValue(this.customerAddresses[index]);
                    } else {
                        this.checkoutForm
                            .get('customerAddress')
                            .patchValue(this.customerAddresses[0]);
                    }

                    // Set default customer address
                    this.setCustomerDetails();
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    checkStoreTiming(
        storeTiming: StoreTiming[],
        storeSnooze: StoreSnooze
    ): void {
        // the only thing that this function required is this.store.storeTiming

        let todayDate = new Date();
        let today = this.daysArray[todayDate.getDay()];

        // check if store closed for all days
        let isStoreCloseAllDay = storeTiming.map((item) => item.isOff);

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
                        openTime.setHours(
                            Number(item.openTime.split(':')[0]),
                            Number(item.openTime.split(':')[1]),
                            0
                        );

                        let closeTime = new Date();
                        closeTime.setHours(
                            Number(item.closeTime.split(':')[0]),
                            Number(item.closeTime.split(':')[1]),
                            0
                        );

                        if (todayDate >= openTime && todayDate < closeTime) {
                            // console.info("We are OPEN today!");

                            // --------------------
                            // Check store snooze
                            // --------------------

                            let snoozeEndTime = new Date(
                                storeSnooze.snoozeEndTime
                            );
                            let nextStoreOpeningTime: string = '';

                            if (storeSnooze.isSnooze === true) {
                                // console.info("Store is currently on snooze");

                                // check if snoozeEndTime exceed closeTime
                                if (snoozeEndTime > closeTime) {
                                    // console.info("Store snooze exceed closeTime");

                                    // ------------------------
                                    // Find next available day
                                    // ------------------------

                                    let dayBeforeArray = storeTiming.slice(
                                        0,
                                        index + 1
                                    );
                                    let dayAfterArray = storeTiming.slice(
                                        index + 1,
                                        storeTiming.length
                                    );

                                    let nextAvailableDay =
                                        dayAfterArray.concat(dayBeforeArray);
                                    nextAvailableDay.forEach(
                                        (object, iteration, array) => {
                                            // this mean store opened
                                            if (object.isOff === false) {
                                                let nextOpenTime = new Date();
                                                nextOpenTime.setHours(
                                                    Number(
                                                        object.openTime.split(
                                                            ':'
                                                        )[0]
                                                    ),
                                                    Number(
                                                        object.openTime.split(
                                                            ':'
                                                        )[1]
                                                    ),
                                                    0
                                                );

                                                let nextCloseTime = new Date();
                                                nextCloseTime.setHours(
                                                    Number(
                                                        object.closeTime.split(
                                                            ':'
                                                        )[0]
                                                    ),
                                                    Number(
                                                        object.closeTime.split(
                                                            ':'
                                                        )[1]
                                                    ),
                                                    0
                                                );

                                                if (todayDate >= nextOpenTime) {
                                                    let nextOpen =
                                                        iteration === 0
                                                            ? 'tommorow at ' +
                                                              object.openTime
                                                            : 'on ' +
                                                              object.day +
                                                              ' ' +
                                                              object.openTime;
                                                    // console.info("We will open " + nextOpen);
                                                    this.notificationMessage =
                                                        'Sorry for the inconvenience, We are closed! We will open ' +
                                                        nextOpen;
                                                    nextStoreOpeningTime =
                                                        'Store will open ' +
                                                        nextOpen;
                                                    array.length =
                                                        iteration + 1;
                                                }
                                            } else {
                                                console.warn(
                                                    'Store currently snooze. Store close on ' +
                                                        object.day
                                                );
                                            }
                                        }
                                    );
                                } else {
                                    nextStoreOpeningTime =
                                        'Store will open at ' +
                                        this._datePipe.transform(
                                            storeSnooze.snoozeEndTime,
                                            'EEEE, h:mm a'
                                        );
                                }

                                if (
                                    storeSnooze.snoozeReason &&
                                    storeSnooze.snoozeReason !== null
                                ) {
                                    this.notificationMessage =
                                        'Sorry for the inconvenience, Store is currently closed due to ' +
                                        storeSnooze.snoozeReason +
                                        '. ' +
                                        nextStoreOpeningTime;
                                } else {
                                    this.notificationMessage =
                                        'Sorry for the inconvenience, Store is currently closed due to unexpected reason. ' +
                                        nextStoreOpeningTime;
                                }
                            }

                            // ---------------------
                            // check for break hour
                            // ---------------------
                            if (
                                item.breakStartTime &&
                                item.breakStartTime !== null &&
                                item.breakEndTime &&
                                item.breakEndTime !== null
                            ) {
                                let breakStartTime = new Date();
                                breakStartTime.setHours(
                                    Number(item.breakStartTime.split(':')[0]),
                                    Number(item.breakStartTime.split(':')[1]),
                                    0
                                );

                                let breakEndTime = new Date();
                                breakEndTime.setHours(
                                    Number(item.breakEndTime.split(':')[0]),
                                    Number(item.breakEndTime.split(':')[1]),
                                    0
                                );

                                if (
                                    todayDate >= breakStartTime &&
                                    todayDate < breakEndTime
                                ) {
                                    // console.info("We are on BREAK! We will open at " + item.breakEndTime);
                                    this.notificationMessage =
                                        'Sorry for the inconvenience, We are on break! We will open at ' +
                                        item.breakEndTime;
                                }
                            }
                        } else if (todayDate < openTime) {
                            // this mean it's open today but it's before store opening hour (store not open yet)
                            this.notificationMessage =
                                'Sorry for the inconvenience, We are closed! We will open at ' +
                                item.openTime;
                        } else {
                            // console.info("We are CLOSED for the day!");

                            // ------------------------
                            // Find next available day
                            // ------------------------

                            let dayBeforeArray = storeTiming.slice(
                                0,
                                index + 1
                            );
                            let dayAfterArray = storeTiming.slice(
                                index + 1,
                                storeTiming.length
                            );

                            let nextAvailableDay =
                                dayAfterArray.concat(dayBeforeArray);
                            nextAvailableDay.forEach(
                                (object, iteration, array) => {
                                    // this mean store opened
                                    if (object.isOff === false) {
                                        let nextOpenTime = new Date();
                                        nextOpenTime.setHours(
                                            Number(
                                                object.openTime.split(':')[0]
                                            ),
                                            Number(
                                                object.openTime.split(':')[1]
                                            ),
                                            0
                                        );

                                        let nextCloseTime = new Date();
                                        nextCloseTime.setHours(
                                            Number(
                                                object.closeTime.split(':')[0]
                                            ),
                                            Number(
                                                object.closeTime.split(':')[1]
                                            ),
                                            0
                                        );

                                        if (todayDate >= nextOpenTime) {
                                            let nextOpen =
                                                iteration === 0
                                                    ? 'tommorow at ' +
                                                      object.openTime
                                                    : 'on ' +
                                                      object.day +
                                                      ' ' +
                                                      object.openTime;
                                            // console.info("We will open " + nextOpen);
                                            this.notificationMessage =
                                                'Sorry for the inconvenience, We are closed! We will open ' +
                                                nextOpen;
                                            array.length = iteration + 1;
                                        }
                                    } else {
                                        console.warn(
                                            'Store close on ' + object.day
                                        );
                                    }
                                }
                            );
                        }
                    } else {
                        console.warn('We are CLOSED today');

                        // ------------------------
                        // Find next available day
                        // ------------------------

                        let dayBeforeArray = storeTiming.slice(0, index + 1);
                        let dayAfterArray = storeTiming.slice(
                            index + 1,
                            storeTiming.length
                        );

                        let nextAvailableDay =
                            dayAfterArray.concat(dayBeforeArray);

                        nextAvailableDay.forEach((object, iteration, array) => {
                            // this mean store opened
                            if (object.isOff === false) {
                                let nextOpenTime = new Date();
                                nextOpenTime.setHours(
                                    Number(object.openTime.split(':')[0]),
                                    Number(object.openTime.split(':')[1]),
                                    0
                                );

                                let nextCloseTime = new Date();
                                nextCloseTime.setHours(
                                    Number(object.closeTime.split(':')[0]),
                                    Number(object.closeTime.split(':')[1]),
                                    0
                                );

                                if (todayDate >= nextOpenTime) {
                                    let nextOpen =
                                        iteration === 0
                                            ? 'tommorow at ' + object.openTime
                                            : 'on ' +
                                              object.day +
                                              ' ' +
                                              object.openTime;
                                    // console.info("We will open " + nextOpen);
                                    this.notificationMessage =
                                        'Sorry for the inconvenience, We are closed! We will open ' +
                                        nextOpen;
                                    array.length = iteration + 1;
                                }
                            } else {
                                this.notificationMessage =
                                    'Sorry for the inconvenience, We are closed today';
                                console.warn(
                                    'Store close on this ' + object.day
                                );
                            }
                        });
                    }
                }
            });
        } else {
            // this indicate that store closed for all days
            this.notificationMessage =
                'Sorry for the inconvenience, We are closed!';
        }
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(
            (item) => item.assetType === 'LogoUrl'
        );
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png';
        }
    }

    setDefaultAddress(address: Address, index?: any) {
        address.isDefault = true;

        this._userService
            .updateCustomerAddress(address.id, address)
            .subscribe((response) => {
                this.defaultAddress = address.id;
            });
    }

    editAddress(addressId: string, index: any, htmlContainer: any) {
        const dialogRef = this._dialog.open(EditAddressComponent, {
            width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',
            maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
            disableClose: true,
            data: { addressId: addressId, store: this.store },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.selectAddress === true) {
                // select the address
                this.selectAddress(result.address, index);

                this.scrollToLeft(htmlContainer);
            }
        });
    }

    selectAddress(address: Address, index?: any) {
        this.checkoutForm.get('customerAddress').patchValue(address);

        // move the selected address to the front
        this.customerAddresses = this.moveArray(
            this.customerAddresses,
            index,
            0
        );

        this.panelOpenState = false;

        this.setCustomerDetails();

        // this is when user is logged in and the checkoutForm is valid
        // auto calculate charges
        // if (this.user && this.checkoutForm.valid) {
        //     this.calculateCharges();
        // } else {
        //     // Change button to Calculate Charges
        //     this.addressFormChanges();
        // }
    }

    moveArray(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }

    addNewAddress(htmlContainer: any): void {
        const dialogRef = this._dialog.open(AddAddressComponent, {
            width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',
            maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
            disableClose: true,
            data: { store: this.store },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.selectAddress === true) {
                // Get customer Addresses
                this._userService
                    .getCustomerAddress(this.user.id)
                    .subscribe((response: any) => {
                        this.customerAddresses = response;

                        let index = this.customerAddresses.findIndex(
                            (element) => element.id === result.address.id
                        );

                        // select the address
                        this.selectAddress(result.address, index);

                        // if first address, set as default
                        if (this.customerAddresses.length === 1) {
                            this.setDefaultAddress(result.address);
                        }
                    });

                this.scrollToLeft(htmlContainer);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    setCustomerDetails() {
        const formData = this.checkoutForm.getRawValue();

        this.checkoutForm
            .get('address')
            .patchValue(formData.customerAddress.address);
        this.checkoutForm.get('city').patchValue(formData.customerAddress.city);
        this.checkoutForm
            .get('email')
            .patchValue(formData.customerAddress.email);
        this.checkoutForm
            .get('phoneNumber')
            .patchValue(formData.customerAddress.phoneNumber);
        this.checkoutForm
            .get('fullName')
            .patchValue(formData.customerAddress.name);
        this.checkoutForm
            .get('state')
            .patchValue(formData.customerAddress.state);
        this.checkoutForm
            .get('postCode')
            .patchValue(formData.customerAddress.postCode);
    }

    deleteAddress(address: Address, index: any) {
        index === undefined ? (index = 0) : (index = index);

        if (address.id === this.defaultAddress) {
            const confirmation = this._fuseConfirmationService.open({
                title: 'Unable to Delete Address',
                message: 'You cannot delete default address',
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'OK',
                        color: 'warn',
                    },
                    cancel: {
                        show: false,
                        label: 'Cancel',
                    },
                },
                dismissible: true,
            });
        } else {
            const confirmation = this._fuseConfirmationService.open({
                title: 'Delete Address',
                message: 'Are you sure you want to delete this address?',
                icon: {
                    name: 'mat_outline:delete_forever',
                    color: 'primary',
                },
                actions: {
                    confirm: {
                        label: 'Delete',
                        color: 'primary',
                    },
                },
            });
            // Subscribe to the confirmation dialog closed action
            confirmation.afterClosed().subscribe((result) => {
                // If the confirm button pressed...
                if (result === 'confirmed') {
                    // Delete the customer on the server
                    this._userService
                        .deleteCustomerAddress(address.id)
                        .subscribe((response) => {
                            if (this.customerAddresses.length > 0) {
                                // this.checkoutForm.get('customerAddress').patchValue(this.customerAddresses[0]);
                                this.selectAddress(this.customerAddresses[0]);
                            } else {
                                this.checkoutForm
                                    .get('customerAddress')
                                    .patchValue('');
                                // Change button to Calculate Charges
                                this.addressFormChanges();
                            }

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });
        }
    }

    claimPromoCode() {
        if (this.promoCode === '') {
            return;
        }

        if (this.user) {
            this._checkoutService
                .postCustomerClaimVoucher(this.user.id, this.promoCode)
                .subscribe(
                    (response: CustomerVoucher) => {
                        this.promoCode = '';

                        // find the verticalcode in the voucher list
                        // if index -1 mean that the voucher can't be used in current store
                        let indexVerticalList =
                            response.voucher.voucherVerticalList.findIndex(
                                (item) =>
                                    item.verticalCode ===
                                    this.store.verticalCode
                            );
                        let indexStoreList =
                            response.voucher.voucherStoreList.findIndex(
                                (item) => item.storeId === this.store.id
                            );

                        if (
                            (response.voucher.voucherType === 'STORE'
                                ? indexStoreList > -1
                                : true) &&
                            indexVerticalList > -1
                        ) {
                            // if voucher is valid
                            this.openVoucherModal(
                                'mat_solid:check_circle',
                                'Congratulations!',
                                'Promo code successfully claimed',
                                null,
                                true
                            );

                            this.selectVoucher(response);
                        } else {
                            // if voucher is invalid for this store
                            this.openVoucherModal(
                                'mat_solid:check_circle',
                                'Congratulations!',
                                'Promo code successfully claimed',
                                null,
                                false
                            );
                        }
                    },
                    (error) => {
                        // if voucher is invalid
                        this.promoCode = '';

                        if (error['status'] === 409) {
                            if (error.error.message) {
                                // if voucher is invalid
                                this.openVoucherModal(
                                    'heroicons_outline:x',
                                    'Error',
                                    error.error.message,
                                    null,
                                    true
                                );
                            } else {
                                // if voucher is invalid
                                this.openVoucherModal(
                                    'heroicons_outline:x',
                                    'Promo code already claimed!',
                                    'Please enter a different code',
                                    null,
                                    true
                                );
                            }
                        }

                        // if voucher is invalid
                        // if (error['status'] === 404) {
                        //     this.openVoucherModal('heroicons_outline:x','Invalid Code!', 'Invalid code, please try again', null, true);

                        // } else if (error['status'] === 409) {
                        //     this.openVoucherModal('heroicons_outline:x','Oops...', 'Sorry, you have claimed this voucher', null, true);

                        // }
                        // else if (error['status'] === 417) {
                        //     this.openVoucherModal('heroicons_outline:x','Oops...', 'Sorry, this promo code has expired', null, true);
                        // }
                    }
                );
        } else {
            if (!this.checkoutForm.get('email').value) {
                const confirmation = this._fuseConfirmationService.open({
                    title: 'Email address required',
                    message: 'Please add your email address to redeem the voucher.',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'warn',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'OK',
                            color: 'warn',
                        },
                        cancel: {
                            show: false,
                            label: 'Cancel',
                        },
                    },
                    dismissible: true,
                });

                return;
            }

            this._checkoutService
                .verifyVoucher({ voucherCode: this.promoCode, storeId: this.store.id, customerEmail: this.checkoutForm.get('email').value })
                .subscribe((voucherResponse: Voucher) => {
                    if (voucherResponse) {
                        
                        let voucher = voucherResponse;
                        this.promoCode = '';

                        // find the verticalcode in the voucher list
                        // if index -1 mean that the voucher can't be used in current store
                        let indexVerticalList =
                            voucher.voucherVerticalList.findIndex(
                                (item) =>
                                    item.verticalCode ===
                                    this.store.verticalCode
                            );
                        let indexStoreList = voucher.voucherStoreList.findIndex(
                            (item) => item.storeId === this.store.id
                        );

                        if (
                            (voucher.voucherType === 'STORE'
                                ? indexStoreList > -1
                                : true) &&
                            indexVerticalList > -1
                        ) {
                            // if voucher is valid
                            this.openVoucherModal(
                                'mat_solid:check_circle',
                                'Congratulations!',
                                'Promo code successfully claimed',
                                null,
                                true
                            );

                            this.displayRedeem = false;

                            this.guestVouchers = {
                                id: null,
                                customerId: null,
                                voucherId: voucher.id,
                                isUsed: false,
                                created: null,
                                voucher: voucher,
                            };
                            this.selectVoucher(this.guestVouchers);
                        } else {
                            // if voucher is invalid for this store
                            this.openVoucherModal(
                                'mat_solid:check_circle',
                                'Congratulations!',
                                'Promo code successfully claimed',
                                null,
                                false
                            );
                        }
                    } else {
                        // if voucher is invalid
                        this.openVoucherModal(
                            'heroicons_outline:x',
                            'Promo code is invalid!',
                            'Please enter a different code',
                            null,
                            true
                        );

                        this.promoCode = '';
                    }
                });
        }
    }

    selectVoucher(voucher: CustomerVoucher) {
        this.voucherApplied = voucher;

        // this.calculateCharges();

        this.voucherDiscountAppliedMax = voucher.voucher.discountValue;

        // voucherCode & customerId

        // change button to Calculate Charges
        this.addressFormChanges();
    }

    deselectVoucher() {
        this.voucherApplied = null;
        this.voucherDiscountAppliedMax = 0;
        this.guestVouchers = null;

        // change button to Calculate Charges
        this.addressFormChanges();
    }

    redirect(pagename: string) {
        // this._route.snapshot.paramMap.get(pagename)
        this._router.navigate([(window.location.href = pagename)]);
    }

    openVoucherModal(
        icon: string,
        title: string,
        description: string,
        voucher: CustomerVoucher,
        isValid: boolean
    ): void {
        const dialogRef = this._dialog.open(VoucherModalComponent, {
            data: {
                icon,
                title,
                description,
                voucher,
                isValid,
            },
        });

        dialogRef.afterClosed().subscribe();
    }

    validateVoucher(voucher: CustomerVoucher) {
        let indexVerticalList = voucher.voucher.voucherVerticalList.findIndex(
            (item) => item.verticalCode === this.store.verticalCode
        );
        let indexStoreList = voucher.voucher.voucherStoreList.findIndex(
            (item) => item.storeId === this.store.id
        );

        if (
            (voucher.voucher.voucherType === 'STORE'
                ? indexStoreList > -1
                : true) &&
            indexVerticalList > -1
        ) {
            return true;
        } else {
            return false;
        }
    }

    promoActionButton() {
        // sign up
        this._document.location.href =
            'https://' +
            this._apiServer.settings.marketplaceDomain +
            '/sign-up' +
            '?redirectURL=' +
            encodeURI('https://' + this.sanatiseUrl + this._router.url) +
            '&guestCartId=' +
            this._cartService.cartId$ +
            '&storeId=' +
            this.store.id;
    }

    private setInitialValue() {
        this.filteredCities
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.stateCitySelector.compareWith = (a: any, b: any) =>
                    a === b;
            });
    }

    private searchAddress(): void {
        const address = this.checkoutForm.get('address').value;
        this.mapSearchService.getPlacePredictions(
            { input: address },
            (
                predictions:
                    | google.maps.places.QueryAutocompletePrediction[]
                    | null,
                status: google.maps.places.PlacesServiceStatus
            ) => {
                this.addressSearchPredictions = [];
                if (
                    status !== google.maps.places.PlacesServiceStatus.OK ||
                    !predictions
                ) {
                    console.log('Status: ' + status);
                    return;
                }
                this.addressSearchPredictions = predictions;
            }
        );
    }

    private onSelectAddress(
        selectedAddress: google.maps.places.QueryAutocompletePrediction
    ): void {
        this.addressSearchPredictions = [];
        console.log('Selected ' + selectedAddress);
        this.checkoutForm
            .get('address')
            .patchValue(selectedAddress.description);
        this.geocoder
            .geocode({ placeId: selectedAddress.place_id })
            .then(({ results }) => {
                if (results[0]) {
                    console.log(results[0]);
                    const location = results[0].geometry.location;

                    this.lat = location.lat();
                    this.lng = location.lng();

                    this.markerPosition = location;
                    this.markerLabel = {
                        color: 'green',
                        text: selectedAddress.description,
                    };

                    this.mapCenter = {
                        lat: location.lat(),
                        lng: location.lng(),
                    };

                    this.mapZoom = 12;
                }
            });
    }

    private onMapClicked(event: google.maps.MapMouseEvent): void {
        // this.marker.position.lat = event.latLng.lat();
        // this.marker.position.lng = event.latLng.lng();
        const coordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };

        this.lat = coordinates.lat;
        this.lng = coordinates.lng;

        this.markerPosition = coordinates;
        this.fillAddressBar(coordinates);
    }

    private fillAddressBar(coordinates: any): void {
        this.isAddressLoading = true;
        this.geocoder
            .geocode({ location: coordinates })
            .then((response) => {
                if (response.results[0]) {
                    this.checkoutForm
                        .get('address')
                        .patchValue(response.results[0].formatted_address);
                }
            })
            .finally(() => {
                this.isAddressLoading = false;
            });
    }
}
