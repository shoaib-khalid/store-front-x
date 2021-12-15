import { Route } from '@angular/router';
import { LandingProductDetailsComponent } from 'app/modules/landing/product-details/product-details.component';

export const landingProductDetailsRoutes: Route[] = [
    {
        path     : '',
        component: LandingProductDetailsComponent
    }
];
