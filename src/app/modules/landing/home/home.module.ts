import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { SlidersModule } from 'app/layout/common/sliders/sliders.module';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { CategoryCarouselComponent } from './category-carousel/category-carousel.component'
import { SwiperModule } from 'swiper/angular';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BannerModule } from 'app/layout/common/banner/banner.module';



@NgModule({
    declarations: [
        LandingHomeComponent,
        CategoryCarouselComponent
    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        SharedModule,
        SwiperModule,
        SlidersModule,
        IvyCarouselModule,
        MatButtonModule,
        MatIconModule,
        NgxGalleryModule,
        BannerModule,
        FontAwesomeModule
    ]
})
export class LandingHomeModule 
{
}

