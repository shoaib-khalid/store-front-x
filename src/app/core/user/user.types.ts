export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

export interface Customer
{
    id: string;
    username: string;
    name: string;
    email: string;
    phoneNumber: number;
    locked: boolean;
    deactivated: boolean;
    created: string;
    updated: string;
    roleId: string;
    storeId: string;
    customerAddress: CustomerAddress[]
}

export interface CustomerAddress
{
    address: string;
    city: string;
    country: string;
    customerId: string;
    email: string;
    id: string;
    name: string;
    phoneNumber: string;
    postCode: string;
    state: string;
}