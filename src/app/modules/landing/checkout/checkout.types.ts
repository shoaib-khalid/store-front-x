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

export interface DeliveryProvider
{
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

    serviceChargesPercentage?: number;
    serviceCharges?: number;

    deliveryCharges?: number;

    grandTotal?: number;
}