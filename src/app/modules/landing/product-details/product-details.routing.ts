import { Route } from '@angular/router';
import { LandingProductDetailsComponent } from 'app/modules/landing/product-details/product-details.component';
import { ProductResolver } from 'app/modules/landing/product-details/product-details.resolver';
import { StoreCategoriesResolver } from '../landing.resolver';

export const landingProductDetailsRoutes: Route[] = [
    {
        path    : ':product-slug',
        resolve  : {
            product: ProductResolver,
            categories: StoreCategoriesResolver
        },
        component: LandingProductDetailsComponent
    },
    {
        path     : '',
        redirectTo: '/catalogue/all-products',
        component: LandingProductDetailsComponent
    }
];
