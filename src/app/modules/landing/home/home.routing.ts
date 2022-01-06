import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { AcademyCoursesResolver } from 'app/modules/landing/home/home.resolver';
import { StoreCategoriesResolver } from 'app/modules/landing/landing.resolver';

export const landingHomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingHomeComponent,
        resolve  : {
            categories: StoreCategoriesResolver,
            courses: AcademyCoursesResolver
        }
    },
    {path: 'academy', loadChildren: () => import('app/modules/landing/academy/academy.module').then(m => m.AcademyModule)},
];
