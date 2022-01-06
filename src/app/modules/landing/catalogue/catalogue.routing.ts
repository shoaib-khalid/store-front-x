import { Route } from '@angular/router';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
import { LandingResolver } from 'app/modules/landing/landing.resolver';
import { ProductsResolver } from 'app/modules/landing/catalogue/catalogue.resolver';

export const landingCatalogueRoutes: Route[] = [
    {
        path     : '',
        redirectTo: 'all-products',
        component: LandingCatalogueComponent
    },
    {
        path    : ':catalogue-slug',
        resolve  : {
            landing: LandingResolver,
            products: ProductsResolver
        },
        component: LandingCatalogueComponent
    }
];
