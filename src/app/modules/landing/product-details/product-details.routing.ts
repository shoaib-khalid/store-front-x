import { Route } from '@angular/router';
import { LandingProductDetailsComponent } from 'app/modules/landing/product-details/product-details.component';
import { ProductsResolver } from '../landing.resolver';

export const landingProductDetailsRoutes: Route[] = [
    {
        path    : ':product-slug',
        resolve  : {
            products: ProductsResolver
        },
        component: LandingProductDetailsComponent
    },
    {
        path     : '',
        redirectTo: '/catalogue/all-products',
        component: LandingProductDetailsComponent
    }
];
