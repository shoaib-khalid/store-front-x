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
    orderPaymentDetail  : 
    {
        accountName                 : string;
        couponId                    : string;
        deliveryQuotationAmount     : number;
        deliveryQuotationReferenceId: string;
        gatewayId                   : string;
        orderId                     : string;
        time                        : string;
    }
    orderShipmentDetail : 
    {
        address                     : string;
        city                        : string;
        country                     : string;
        customerTrackingUrl         : string;
        deliveryProviderId          : string;
        deliveryType                : string;
        email                       : string;
        merchantTrackingUrl         : string;
        orderId                     : string;
        phoneNumber                 : string;
        receiverName                : string;
        state                       : string;
        storePickup                 : boolean;
        trackingNumber              : string;
        trackingUrl                 : string;
        zipcode                     : string;
    }
    paymentStatus: string;
    paymentType: string;
    privateAdminNotes: string;
    store: {
        id: string,
        name: string,
        city: string,
        address: string,
        clientId: string,
        postcode: string,
        state: string,
        contactName: string,
        phone: string,
        phoneNumber: string,
        email: string,
        verticalCode: string,
        serviceChargesPercentage: number,
        paymentType: string,
        invoiceSeqNo: number,
        nameAbreviation: string
    }
    storeId: string;
    storeServiceCharges: number;
    storeShare: number;
    subTotal: number;
    total: number;
    updated: string;
}

export interface OrderDetails
{
    id: string,
    storeId: string,
    subTotal: number,
    deliveryCharges: number,
    total: number,
    completionStatus: string,
    paymentStatus: string,
    customerNotes: string,
    privateAdminNotes: string,
    cartId: string,
    customerId: string,
    created: string,
    updated: string,
    invoiceId: string,
    totalReminderSent: string,
    klCommission: string,
    storeServiceCharges: string,
    storeShare: string,
    paymentType: string,
    deliveryType: string,
    appliedDiscount: string,
    deliveryDiscount: string,
    appliedDiscountDescription: string,
    deliveryDiscountDescription: string,
    beingProcess: string,
    discountId: string,
    discountCalculationType: string,
    discountCalculationValue: string,
    discountMaxAmount: string,
    deliveryDiscountMaxAmount: string,
    isRevised: string,
    orderShipmentDetail: {
        receiverName: string,
        phoneNumber: string,
        address: string,
        city: string,
        zipcode: string,
        email: string,
        deliveryProviderId: string,
        state: string,
        country: string,
        trackingUrl: string,
        orderId: string,
        storePickup: string,
        merchantTrackingUrl: string,
        customerTrackingUrl: string,
        trackingNumber: string,
        deliveryType: string,
        vehicleType: string,
        fulfilmentType: string,
        deliveryServiceProvider: 
            {
            id: string,
            name: string
            },
        deliveryPeriodDetails: {
            id: string,
            name: string,
            description: string
            }
    },
    orderPaymentDetail: {
        accountName: string,
        gatewayId: string,
        couponId: string,
        time: string,
        orderId: string,
        deliveryQuotationReferenceId: string,
        deliveryQuotationAmount: string
    },
    store: {
        id: string,
        name: string,
        city: string,
        address: string,
        clientId: string,
        postcode: string,
        state: string,
        contactName: string,
        phone: string,
        phoneNumber: string,
        email: string,
        verticalCode: string,
        serviceChargesPercentage: string,
        paymentType: string,
        invoiceSeqNo: string,
        nameAbreviation: string
    },
    customer: {
        id: string,
        name: string,
        phoneNumber: string,
        email: string,
        created: string,
        updated: string
    },
    orderRefund: [],
    orderItemWithDetails: [
        {
        id: string,
        orderId: string,
        productId: string,
        price: 3,
        productPrice: 3,
        weight: string,
        quantity: number,
        itemCode: string,
        productName: string,
        specialInstruction: string,
        productVariant: string,
        discountId: string,
        normalPrice: string,
        discountLabel: string,
        status: string,
        originalQuantity: string,
        discountCalculationType: string,
        discountCalculationValue: string,
        orderSubItem: string,
        itemAssetDetails: [
            {
            id: string,
            itemCode: string,
            name: string,
            url: string,
            productId: string
            }
        ],
        SKU:string
        }
    ]
}

export interface OrderItemWithDetails
{
    id: string,
    orderId: string,
    productId: string,
    price: number,
    productPrice: number,
    weight: string,
    quantity: number,
    itemCode: string,
    productName: string,
    specialInstruction: string,
    productVariant: string,
    discountId: string,
    normalPrice: string,
    discountLabel: string,
    status: string,
    originalQuantity: string,
    discountCalculationType: string,
    discountCalculationValue: string,
    orderSubItem: string,
    SKU:string
    itemAssetDetails: [
        {
        id: string,
        itemCode: string,
        name: string,
        url: string,
        productId: string
        }
    ],
}

export interface OrderItem
{
    id: string;
    orderId: string;
    productId: string;
    price: number;
    productPrice: number;
    weight: string;
    quantity: number;
    itemCode: string;
    productName: string;
    specialInstruction: string;
    productVariant: string;
    SKU: string;
}

export interface DeliveryRiderDetails
{
    name: string;
    phoneNumber: string;
    plateNumber: string;
    trackingUrl: string;
    orderNumber: string;
    provider: {
        id : number;
        name : string;
        providerImage : string;
    }
    airwayBill: string;
}

