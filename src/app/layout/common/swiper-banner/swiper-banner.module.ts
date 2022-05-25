import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SwiperBannerComponent } from './swiper-banner.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
    declarations: [
        SwiperBannerComponent
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterModule,
        SharedModule,
        FontAwesomeModule,
        SwiperModule,

    ],
    exports     : [
        SwiperBannerComponent
    ]
})
export class SwiperBannerModule
{
}
