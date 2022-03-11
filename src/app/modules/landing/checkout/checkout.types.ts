export interface DeliveryCharges
{
    cartId: string;
    customerId: string;
    delivery: DeliveryDetails;
    deliveryProviderId?: string;
    storeId: string;
}

export interface DeliveryDetails
{
    deliveryAddress: string;
    deliveryCity: string;
    deliveryContactEmail: string;
    deliveryContactName: string;
    deliveryContactPhone: string;
    deliveryCountry: string;
    deliveryPostcode: string;
    deliveryState: string;
}

export interface DeliveryProviderGroup
{
    providerId: string;
    deliveryProviders: DeliveryProvider[];
}

export interface DeliveryProvider
{
    deliveryPeriod: {
        id: string;
        description: string;
        name: string;
    };
    deliveryType: string;
    isError: boolean;
    message?: string;
    price: number;
    providerId: string;
    providerImage: string;
    providerName: string;
    refId: string;
    validUpTo: string;
}

export interface CartDiscount
{
    cartSubTotal: number;
    deliveryDiscount: number;
    deliveryDiscountDescription: string;
    deliveryDiscountMaxAmount: number;
    discountCalculationType: string;
    discountCalculationValue: number;
    discountId?: string;
    discountMaxAmount: number;
    discountType: string;
    subTotalDiscount: number;
    subTotalDiscountDescription: string;
    storeServiceChargePercentage: number;
    storeServiceCharge: number;
    deliveryCharges: number;
    cartGrandTotal: number;
}

export interface Payment
{
    hash: string;
    isSuccess: boolean;
    orderCreated?: {
        createdDate: string;
        spErrorCode: number;
    };
    paymentLink: string;
    providerId: string;
    sysTransactionId: string;
}

export interface Order
{
    appliedDiscount: number;
    appliedDiscountDescription: string;
    beingProcess: string;
    cartId: string;
    completionStatus: string;
    created: string;
    customer: string;
    customerId: string;
    customerNotes: string;
    deliveryCharges: number;
    deliveryDiscount: number;
    deliveryDiscountDescription: string;
    deliveryDiscountMaxAmount: number;
    deliveryType: string;
    discountCalculationType: string;
    discountCalculationValue: number;
    discountId: string;
    discountMaxAmount: number;
    id: string;
    invoiceId: string;
    klCommission: number;
    orderPaymentDetail: {
        accountName: string;
        couponId: string;
        deliveryQuotationAmount:  number;
        deliveryQuotationReferenceId: string;
        gatewayId: string;
        orderId: string;
        time: string;
    }
    orderShipmentDetail: {
        address: string;
        city: string;
        country: string;
        customerTrackingUrl: string;
        deliveryProviderId: string;
        deliveryType: string;
        email: string;
        merchantTrackingUrl: string;
        orderId: string;
        phoneNumber: string;
        receiverName: string;
        state: string;
        storePickup: boolean;
        trackingNumber: string;
        trackingUrl: string;
        zipcode: string;
    }
    paymentStatus: string;
    paymentType: string;
    privateAdminNotes: string;
    store: string;
    storeId: string;
    storeServiceCharges: number;
    storeShare: number;
    subTotal: number;
    total: number;
    updated: string;
}