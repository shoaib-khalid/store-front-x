import { Route } from '@angular/router';
import { LandingCheckoutComponent } from 'app/modules/landing/checkout/checkout.component';
import { CheckoutResolver } from './checkout.resolver';

export const landingCheckoutRoutes: Route[] = [
    {
        path        : '',
        resolve     : {
            checkout : CheckoutResolver
        },
        component   : LandingCheckoutComponent
    }
];
