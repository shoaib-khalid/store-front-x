import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingProductDetailsComponent } from 'app/modules/landing/product-details/product-details.component';
import { landingProductDetailsRoutes } from 'app/modules/landing/product-details/product-details.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [
        LandingProductDetailsComponent,
    ],
    imports     : [
        RouterModule.forChild(landingProductDetailsRoutes),
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        NgxGalleryModule,
        FontAwesomeModule,
        SharedModule
    ],
    exports     : [
        FontAwesomeModule,
        NgxGalleryModule
    ]
})
export class LandingProductDetailsModule
{
}
