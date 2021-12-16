import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { LandingHomeResolver } from 'app/modules/landing/home/home.resolver';

export const landingHomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingHomeComponent,
        resolve  : {
            landingHomeResolver: LandingHomeResolver
        }
    }
];
