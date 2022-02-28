import { Route } from '@angular/router';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
// import { ProductsResolver, StoreCategoriesResolver } from 'app/modules/landing/landing.resolver';
import { LandingProductDetailsComponent } from '../product-details/product-details.component';
import { ProductResolver } from '../product-details/product-details.resolver';

export const landingCatalogueRoutes: Route[] = [  
    // {
    //     path    : ':catalogue-slug/:product-slug',
    //     data: {
    //         breadcrumb: ''
    //     },
        
    // },
    {
        path    : ':catalogue-slug',
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
                component: LandingCatalogueComponent,
            },
            {
                path: ':product-slug',
                resolve  : {
                    product: ProductResolver,
                    // categories: StoreCategoriesResolver
                },
                component: LandingProductDetailsComponent,
                data: {
                    breadcrumb: ''
                }
            }
        ],
    },
    {
        path     : '',
        redirectTo: 'all-products',
        component: LandingCatalogueComponent
    }
];
