import { Route } from '@angular/router';
// import { BuyerAuthGuard } from 'app/core/buyer/guards/buyer-auth.guard';



export const buyerRoutes: Route[] = [
        // Buyer routes

        {
            path       : 'buyer',
            // canActivate: [BuyerAuthGuard],
            // canActivateChild: [BuyerAuthGuard],
            children   : [
                {path: 'buyerexample', loadChildren: () => import('app/modules/buyer/example/example.module').then(m => m.ExampleModule)},
            ]
        },
        {
            path       : '',
            children   : [

            ]
        }
]; 
