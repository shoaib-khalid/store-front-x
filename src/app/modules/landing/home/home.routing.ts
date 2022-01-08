import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { StoreCategoriesResolver, StoreDiscountsResolver } from 'app/modules/landing/landing.resolver';

export const landingHomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingHomeComponent,
        resolve  : {
            categories: StoreCategoriesResolver,
            discounts: StoreDiscountsResolver
        }
    },
];
