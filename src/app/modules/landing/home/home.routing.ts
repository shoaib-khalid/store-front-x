import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { LandingHomeResolver, AcademyCoursesResolver } from 'app/modules/landing/home/home.resolver';

export const landingHomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingHomeComponent,
        resolve  : {
            landingHomeResolver: LandingHomeResolver,
            courses: AcademyCoursesResolver
        }
    },
    {path: 'academy', loadChildren: () => import('app/modules/landing/academy/academy.module').then(m => m.AcademyModule)},
];
