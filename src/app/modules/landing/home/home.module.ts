import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';
import { IvyCarouselModule } from 'angular-responsive-carousel';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { academyRoutes } from 'app/modules/landing/academy/academy.routing';
import { AcademyComponent } from 'app/modules/landing/academy/academy.component';
import { AcademyDetailsComponent } from 'app/modules/landing/academy/details/details.component';
import { AcademyListComponent } from 'app/modules/landing/academy/list/list.component';
import { DiscountBannerComponent } from 'app/shared/discount-banner/discount-banner.component';

@NgModule({
    declarations: [
        LandingHomeComponent,
        DiscountBannerComponent,
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

        // MatFormFieldModule,
        // MatInputModule,
        // MatSelectModule,
        // MatTooltipModule,
        // FuseFindByKeyPipeModule
    ]
})
export class LandingHomeModule
{
}
