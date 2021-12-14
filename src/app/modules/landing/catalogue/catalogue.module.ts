import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SharedModule } from 'app/shared/shared.module';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
import { landingCatalogueRoutes } from 'app/modules/landing/catalogue/catalogue.routing';

@NgModule({
    declarations: [
        LandingCatalogueComponent
    ],
    imports     : [
        RouterModule.forChild(landingCatalogueRoutes),
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        NgxSliderModule,
        SharedModule
    ]
})
export class LandingCatalogueModule
{
}
