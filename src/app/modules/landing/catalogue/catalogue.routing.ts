import { Route } from '@angular/router';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';

export const landingCatalogueRoutes: Route[] = [
    {
        path     : '',
        component: LandingCatalogueComponent
    },
    {
        path    : ':catalogue-slug',
        component: LandingCatalogueComponent
    }
];
