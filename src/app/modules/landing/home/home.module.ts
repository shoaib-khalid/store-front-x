import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DiscountBannerComponent } from 'app/shared/store-discount/store-discount.component';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { CategoryCarouselComponent } from './category-carousel/category-carousel.component'

@NgModule({
    declarations: [
        LandingHomeComponent,
        DiscountBannerComponent,
        CategoryCarouselComponent
    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        IvyCarouselModule,

        MatTabsModule,
        MatSidenavModule,

        MatProgressBarModule,
        MatSlideToggleModule,
    ]
})
export class LandingHomeModule
{
}
