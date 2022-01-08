import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { SlidersModule } from 'app/layout/common/sliders/sliders.module';

import { IvyCarouselModule } from 'angular-responsive-carousel';
import { CategoryCarouselComponent } from './category-carousel/category-carousel.component'

import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';

@NgModule({
    declarations: [
        LandingHomeComponent,
        CategoryCarouselComponent
    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        SharedModule,

        SlidersModule,

        IvyCarouselModule,
    ]
})
export class LandingHomeModule
{
}
