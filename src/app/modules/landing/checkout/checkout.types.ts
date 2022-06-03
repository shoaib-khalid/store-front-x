export class CheckoutInputField {
    fullName    = { name: 'Full name', placeholder: 'Enter full name' };
    // firstName   : { name: 'First Name', placeholder: 'Enter first name' };
    // lastName    : { name: 'Last Name', placeholder: 'Enter last name' };
    email       = { name: 'Email', placeholder: 'Enter email address' };
    phoneNumber = { name: 'Phone number', placeholder: 'Enter phone number' };
    address     = { name: 'Address', placeholder: 'Enter address' };
    postCode    = { name: 'Postcode', placeholder: 'Enter postcode' };
    state       = { name: 'State', placeholder: 'Enter state' };
    city        = { name: 'City', placeholder: 'Enter city' };
    country        = { name: 'Country', placeholder: 'Enter country' };
}

export interface DeliveryCharges
{
    cartId              : string;
    customerId          : string;
    delivery            : DeliveryDetails;
    deliveryProviderId? : string;
    storeId             : string;
}

export interface DeliveryDetails
{
    deliveryAddress         : string;
    deliveryCity            : string;
    deliveryContactEmail    : string;
    deliveryContactName     : string;
    deliveryContactPhone    : string;
    deliveryCountry         : string;
    deliveryPostcode        : string;
    deliveryState           : string;
    deliveryPickUp          : DeliveryPickup;
}
export interface DeliveryPickup{
    latitude: number;
    longitude: number;

}

export interface DeliveryProviderGroup
{
    providerId          : string;
    deliveryProviders   : DeliveryProvider[];
}

export interface DeliveryProvider
{
    deliveryPeriod  : {
        id          : string;
        description : string;
        name        : string;
    };
    deliveryType    : string;
    isError         : boolean;
    message?        : string;
    price           : number;
    providerId      : string;
    providerImage   : string;
    providerName    : string;
    refId           : string;
    validUpTo       : string;
}

export interface CartDiscount
{
    cartSubTotal                : number;
    deliveryDiscount            : number;
    deliveryDiscountDescription : string;
    deliveryDiscountMaxAmount   : number;
    discountCalculationType     : string;
    discountCalculationValue    : number;
    discountId?                 : string;
    discountMaxAmount           : number;
    discountType                : string;
    subTotalDiscount            : number;
    subTotalDiscountDescription : string;
    storeServiceChargePercentage: number;
    storeServiceCharge          : number;
    deliveryCharges             : number;
    cartGrandTotal              : number;
    voucherDeliveryDiscount     : number;
    voucherDiscountMaxAmount    : number;
    voucherDiscountType         : string;
    voucherSubTotalDiscount     : number;
    voucherDeliveryDiscountDescription  : string;
    voucherDiscountCalculationType      : string;
    voucherDiscountCalculationValue     : number;
    voucherSubTotalDiscountDescription  : string;
}

export interface Payment
{
    hash?           : string;
    token?          : string;
    isSuccess       : boolean;
    orderCreated?   : {
        createdDate : string;
        spErrorCode : number;
    };
    paymentLink     : string;
    providerId      : string;
    sysTransactionId: string;
}

export interface Order
{
    appliedDiscount             : number;
    appliedDiscountDescription  : string;
    beingProcess                : string;
    cartId                      : string;
    completionStatus            : string;
    created                     : string;
    customer                    : string;
    customerId                  : string;
    customerNotes               : string;
    deliveryCharges             : number;
    deliveryDiscount            : number;
    deliveryDiscountDescription : string;
    deliveryDiscountMaxAmount   : number;
    deliveryType                : string;
    discountCalculationType     : string;
    discountCalculationValue    : number;
    discountId                  : string;
    discountMaxAmount           : number;
    id                          : string;
    invoiceId                   : string;
    klCommission                : number;
    orderPaymentDetail  : {
        accountName             : string;
        couponId                : string;
        deliveryQuotationAmount :  number;
        deliveryQuotationReferenceId: string;
        gatewayId               : string;
        orderId                 : string;
        time                    : string;
    }
    orderShipmentDetail : {
        address                 : string;
        city                    : string;
        country                 : string;
        customerTrackingUrl     : string;
        deliveryProviderId      : string;
        deliveryType            : string;
        email                   : string;
        merchantTrackingUrl     : string;
        orderId                 : string;
        phoneNumber             : string;
        receiverName            : string;
        state                   : string;
        storePickup             : boolean;
        trackingNumber          : string;
        trackingUrl             : string;
        zipcode                 : string;
    }
    paymentStatus               : string;
    paymentType                 : string;
    privateAdminNotes           : string;
    store                       : string;
    storeId                     : string;
    storeServiceCharges         : number;
    storeShare                  : number;
    subTotal                    : number;
    total                       : number;
    updated                     : string;
}

export interface Address
{
    address     : string;
    city        : string;
    country     : string;
    customerId  : string;
    email       : string;
    id          : string;
    name        : string;
    phoneNumber : string;
    postCode    : string;
    state       : string;
    isDefault?  : boolean;
}

/// VOUCHER

export interface Voucher
{
    id                : string;
    name              : string;
    storeId           : string;
    discountValue     : number;
    maxDiscountAmount : number;
    voucherCode       : string;
    totalQuantity     : number;
    totalRedeem       : number;
    status            : string;
    voucherType       : string;
    discountType      : string;
    calculationType   : string;
    startDate         : string;
    endDate           : string;
    isNewUserVoucher  : boolean;
    voucherVerticalList : VoucherVerticalList[];
}

export interface VoucherVerticalList
{
    id: string;
    regionVertical: {
        code: string;
        commissionPercentage: number;
        customerActivationNotice: string;
        defaultLogoUrl: string;
        description: string;
        domain: string;
        minChargeAmount: number;
        name: string;
        regionId: string;
        senderEmailAdress: string;
        senderEmailName: string;
        thumbnailUrl: string;
    };
    verticalCode: string;
    voucherId: string;
}

export interface CustomerVoucher
{
    id          : string;
    customerId  : string;
    voucherId   : string;
    isUsed      : boolean;
    created     : string;
    voucher     : Voucher;
}

export interface CustomerVoucherPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export interface UsedCustomerVoucherPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export interface PromoText
{
    eventId      : PromoEventId;
    displayText  : string;
    id           : string;
    verticalCode : string;
}

export interface PromoTextPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export enum PromoEventId {
    Guest = 'guest-checkout',
    Customer ='customer-checkout'
}