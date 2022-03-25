import { Route } from '@angular/router';
// import { BuyerAuthGuard } from 'app/core/buyer/guards/buyer-auth.guard';



export const buyerRoutes: Route[] = [
        // Buyer routes
        {
            path       : 'buyer',
            // canActivate: [BuyerAuthGuard],
            // canActivateChild: [BuyerAuthGuard],
            children   : [
                {path: 'homepage', loadChildren: () => import('app/modules/buyer/homepage/homepage.module').then(m => m.HomePageModule)},
                // {path: 'order-details', loadChildren: () => import('app/modules/buyer/order-details/order-details.module').then(m => m.OrderDetailsModule)},
            ]
        },
        {
            path       : '',
            children   : [

            ]
        }
]; 
