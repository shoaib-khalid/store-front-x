import { Route } from '@angular/router';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
import { ProductsResolver, StoreCategoriesResolver } from 'app/modules/landing/landing.resolver';

export const landingCatalogueRoutes: Route[] = [
    {
        path     : '',
        redirectTo: 'all-products',
        component: LandingCatalogueComponent
    },
    {
        path    : ':catalogue-slug',
        resolve  : {
            products: ProductsResolver,
            // categories: StoreCategoriesResolver,
            // cartItems: CartItemsResolver
        },
        data: {
            breadcrumb: ''
        },
        component: LandingCatalogueComponent
    }
];
