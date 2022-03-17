import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HomePageComponent } from './homepage.component';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: HomePageComponent
    }
];

@NgModule({
    declarations: [
        HomePageComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes)
    ]
})
export class HomePageModule
{
}
