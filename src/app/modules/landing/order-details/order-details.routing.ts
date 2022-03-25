import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { StoreCategoriesResolver, StoreDiscountsResolver } from 'app/modules/landing/landing.resolver';
import { OrderDetailsComponent } from './order-details.component';

export const orderDetailsRoutes: Route[] = [
    {
        path     : '',
        component: OrderDetailsComponent,
        resolve  : {
            // categories: StoreCategoriesResolver,
            // discounts: StoreDiscountsResolver
        }
    },
];