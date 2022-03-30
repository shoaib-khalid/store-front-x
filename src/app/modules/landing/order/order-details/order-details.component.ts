import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseConfirmationDialogComponent } from '@fuse/services/confirmation/dialog/dialog.component';
import { DeliveryRiderDetails, Order, OrderDetails, OrderItem } from '../order-list/order-list.type';
import { OrderListService } from '../order-list/order-list.service';


@Component({
    selector     : 'app-order-details',
    templateUrl  : './order-details.component.html',
    styles: [
      `
      /* to remove visible container when window dialog is opened  */
      ::ng-deep .order-invoice-custom-dialog-class {
        mat-dialog-container {
          padding: 0 !important;
        }
      }
      `
    ]
})
export class OrderDetailsComponent implements OnInit
{
 
    store$: Store;
    ordersDetails$: Observable<OrderDetails[]>;

    detailsForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    order: Order;
    orderId: string;
    timezone: string;
    timezoneString: any;
    dateCreated: Date;
    dateUpdated: Date;
    deliveryDiscountDescription: any;
    appliedDiscountDescription: any;
    
    constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _activatedRoute: ActivatedRoute,
      private _formBuilder: FormBuilder,
      private _storesService: StoresService,
      private _ordersService: OrderListService,
      private _fuseConfirmationService: FuseConfirmationService,
      public _dialog: MatDialog,
      private _orderSevice: OrderListService,
      public _matDialogRef: MatDialogRef<OrderDetailsComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      
    ) { }
  
  
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
  
    /**
     * Getter for storeId
     */
     get storeId(): string
     {
         return localStorage.getItem('storeId') ?? '';
     } 
  
  
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
  
    /**
     * On init
     */
  
    ngOnInit(): void {
      // Create details form
      this.detailsForm = this._formBuilder.group({
        storeId             : [''],
        storeLogo           : [''],
        storeName           : [''],
        storeAddress        : [''],
        storePhoneNumber    : [''],
        storeEmail          : [''],
        storeUrl            : [''],
        storeQrCode         : [''],
        customerName        : [''],
        customerAddress     : [''],
        customerPhoneNumber : [''],
        customerEmail       : [''],
        invoiceId           : [''],
        invoiceCreatedDate  : [''],
        invoiceUpdatedDate  : [''],
        items               : this._formBuilder.array([{
          productName       : [''],        
          price             : [0],
          quantity          : [0],
          total             : [0],
        }]), 
        subTotal            : [0],
        // discount            : [0],
        storeServiceCharges : [0],
        deliveryCharges     : [0],
        deliveryDiscount    : [0], 
        deliveryType  : [''],     
        deliveryDiscountDescription: [0],
        total               : [0],
        discountCalculationValue: [0],
        appliedDiscount     :[0],
        discountMaxAmount   :[0],
        appliedDiscountDescription : [0],
        riderDetails        : this._formBuilder.group({
          name: [''],
          phoneNumber: [''],
          plateNumber: [''],
          trackingUrl: [''],
          orderNumber: [''],
          provider: [''],
          providerImage: [''],
          airwayBill: [''],
        }),
        deliveryDiscountMaxAmount : [],
        customerNotes: [''], //order level
        paymentType: [''],
        completionStatus: [''],
        deliveryPeriodDetails:this._formBuilder.group({
          id: [''],
          name: [''],
          description: [''],
        }) 
      });   

      this._storesService.store$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((store: Store)=>{
          this.store$ = store;
          this.timezone = store.regionCountry.timezone;
      });  
  
      // Get param from _activatedRoute first
      this._activatedRoute.params.subscribe(async params => {
        // this.orderId =  params['order_id'];
        this.orderId =  this.data;

        // then getOrderById
        this._ordersService.getOrderById(this.orderId)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((order: Order) => {
  
            // Update the pagination
            this.order = order["data"];

            // patch the value from order to invoice form
            this.detailsForm.patchValue(order["data"]);

            this.detailsForm.get('storeName').setValue(order["data"].store.name);
            this.detailsForm.get('storeAddress').setValue(order["data"].store.address);
            this.detailsForm.get('storePhoneNumber').setValue(order["data"].store.phone);
            this.detailsForm.get('storeEmail').setValue(order["data"].store.email);
            this.detailsForm.get('storeUrl').setValue(""); 
            this.detailsForm.get('customerName').setValue(order["data"].orderPaymentDetail.accountName);
            this.detailsForm.get('customerAddress').setValue(order["data"].orderShipmentDetail.address);
            this.detailsForm.get('customerPhoneNumber').setValue(order["data"].orderShipmentDetail.phoneNumber);
            this.detailsForm.get('customerEmail').setValue(order["data"].orderShipmentDetail.email);
            this.detailsForm.get('subTotal').setValue(order["data"].subTotal)

            // set discountCalculationValue if not null
            if (order["data"].discountCalculationValue != null)
              this.detailsForm.get('discountCalculationValue').setValue(order["data"].discountCalculationValue);

            // set discountMaxAmount if not null
            if (order["data"].discountMaxAmount != null)
              this.detailsForm.get('discountMaxAmount').setValue(order["data"].discountMaxAmount);
              
            // set deliveryDiscountMaxAmount if not null
            if (order["data"].deliveryDiscountMaxAmount != null)
              this.detailsForm.get('deliveryDiscountMaxAmount').setValue(order["data"].deliveryDiscountMaxAmount);

            // to add currency symbol to fixed value, and remove negative (-) sign
            if (order["data"].deliveryDiscountDescription != null){
              
              if (order["data"].deliveryDiscountDescription.includes("%") && order["data"].deliveryDiscountDescription.includes("-")){
                this.deliveryDiscountDescription = order["data"].deliveryDiscountDescription.slice(1);
              }
              else if (order["data"].deliveryDiscountDescription.includes("-")){
                this.deliveryDiscountDescription = order["data"].deliveryDiscountDescription.replace('-', this.store$.regionCountry.currencySymbol)
              }
              else
              this.deliveryDiscountDescription = this.store$.regionCountry.currencySymbol.concat(order["data"].deliveryDiscountDescription) 
              
            }
            
            // to add currency symbol to fixed value, and remove negative (-) sign
            if (order["data"].appliedDiscountDescription != null){
              
              if (order["data"].appliedDiscountDescription.includes("%") && order["data"].appliedDiscountDescription.includes("-")){
                this.appliedDiscountDescription = order["data"].appliedDiscountDescription.slice(1);
              }
              else if (order["data"].appliedDiscountDescription.includes("-")){
                this.appliedDiscountDescription = order["data"].appliedDiscountDescription.replace('-', this.store$.regionCountry.currencySymbol)
              }
              else
              this.appliedDiscountDescription = this.store$.regionCountry.currencySymbol.concat(order["data"].appliedDiscountDescription) 
              
            }
            
            var TimezoneName = this.timezone;
            
            // Generating the formatted text
            var options : any = {timeZone: TimezoneName, timeZoneName: "short"};
            var dateText = Intl.DateTimeFormat([], options).format(new Date);
            
            // Scraping the numbers we want from the text
            this.timezoneString = dateText.split(" ")[1].slice(3);
            
            // Getting the offset
            var timezoneOffset = parseInt(this.timezoneString.split(':')[0])*60;

            // Checking for a minutes offset and adding if appropriate
            if (this.timezoneString.includes(":")) {
              var timezoneOffset = timezoneOffset + parseInt(this.timezoneString.split(':')[1]);
            }

            this.dateCreated = new Date(order["data"].created);
            this.dateUpdated = new Date(order["data"].updated);

            this.dateCreated.setHours(this.dateCreated.getHours() - (-timezoneOffset) / 60);
            this.dateUpdated.setHours(this.dateUpdated.getHours() - (-timezoneOffset) / 60);

            this.detailsForm.get('invoiceCreatedDate').setValue(this.dateCreated);
            this.detailsForm.get('invoiceUpdatedDate').setValue(this.dateUpdated);

            this.detailsForm.patchValue(
              { 
                deliveryPeriodDetails : { 
                  id        : order["data"].orderShipmentDetail.deliveryPeriodDetails?.id? order["data"].orderShipmentDetail.deliveryPeriodDetails.id : '',
                  description : order["data"].orderShipmentDetail.deliveryPeriodDetails?.description? order["data"].orderShipmentDetail.deliveryPeriodDetails.description : '',   
                  name : order["data"].orderShipmentDetail.deliveryPeriodDetails?.name? order["data"].orderShipmentDetail.deliveryPeriodDetails.name : '',
                    
                  }
              })     

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

          
        // next getOrderItemsById
        this._ordersService.getOrderItemsById(this.orderId)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((orderItems: OrderItem[]) => {
            
            // Clear items form array
            (this.detailsForm.get('items') as FormArray).clear();
            
            // Setup item form array
            const itemsFormGroups = [];
            
            // Iterate through OrderItem from BE
            orderItems["data"].content.forEach((item) => {
              
                // Split product variant and set as array
                if (item.productVariant != null) {
  
                  var variant = item.productVariant;
                  var variantArr = variant.split(',');
                  item.productVariant = this._formBuilder.array(variantArr)
  
                }
  
                // Create item form group
                item.orderSubItem = this._formBuilder.array(item.orderSubItem)
                itemsFormGroups.push(
                  this._formBuilder.group(item)
                )
                
              })
              
              // Add the item form group to the items form array     
              itemsFormGroups.forEach((itemFormGroup) => {
                (this.detailsForm.get('items') as FormArray).push(itemFormGroup)
                
              })
 
  
          });
  
        // next getStoreAssets
        let storeAsset = await this._storesService.getStoreAssets(this.storeId);
        this.detailsForm.get('storeLogo').setValue(storeAsset.logoUrl);
        this.detailsForm.get('storeQrCode').setValue(storeAsset.qrCodeUrl);


        // get DeliveryRiderDetails
        this._ordersService.getDeliveryRiderDetails(this.orderId)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((rider: DeliveryRiderDetails) => {
        
        this.detailsForm.patchValue(
          { 
            riderDetails : { 
              name        : rider.name? rider.name : '',
              orderNumber : rider.orderNumber? rider.orderNumber : '',   
              phoneNumber : rider.phoneNumber? rider.phoneNumber : '',
              plateNumber : rider.plateNumber? rider.plateNumber : '',
              provider    : rider.provider? rider.provider.name : '',
              providerImage: rider.provider? rider.provider.providerImage : '',
              trackingUrl : rider.trackingUrl? rider.trackingUrl : '',     
              airwayBill  : rider.airwayBill? rider.airwayBill : ''                                    
              }
          })
        });

      });
  }
  
  close(){
    this._matDialogRef.close()
  }
}
