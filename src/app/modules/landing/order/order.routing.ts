import { Route } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';

export const orderRoutes: Route[] = [
    {
        path     : ':progress-slug',
        data: {
            breadcrumb: ''
        },
        children   : [
            {
                path: '',
                resolve  : {
                    // products: ProductsResolver,
                    // categories: StoreCategoriesResolver
                },
                data: {
                    breadcrumb: ''
                },
                component: OrderListComponent,
            }
        ],
        // component: OrderDetailsComponent,
        // resolve  : {
        //     // categories: StoreCategoriesResolver,
        //     // discounts: StoreDiscountsResolver
        // }
    },
    {
        path     : '',
        redirectTo: 'all-progress',
        component: OrderListComponent
    }
];