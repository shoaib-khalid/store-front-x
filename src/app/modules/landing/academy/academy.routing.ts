import { Route } from '@angular/router';
import { AcademyComponent } from 'app/modules/landing/academy/academy.component';
import { AcademyListComponent } from 'app/modules/landing/academy/list/list.component';
import { AcademyDetailsComponent } from 'app/modules/landing/academy/details/details.component';
import { AcademyCategoriesResolver, AcademyCourseResolver, AcademyCoursesResolver } from 'app/modules/landing/academy/academy.resolvers';

export const academyRoutes: Route[] = [
    {
        path     : '',
        component: AcademyComponent,
        resolve  : {
            categories: AcademyCategoriesResolver
        },
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: AcademyListComponent,
                resolve  : {
                    courses: AcademyCoursesResolver
                }
            },
            {
                path     : ':id',
                component: AcademyDetailsComponent,
                resolve  : {
                    course: AcademyCourseResolver
                }
            }
        ]
    }
];
