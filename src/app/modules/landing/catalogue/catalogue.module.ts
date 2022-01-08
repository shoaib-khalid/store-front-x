import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
import { landingCatalogueRoutes } from 'app/modules/landing/catalogue/catalogue.routing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';

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
        MatPaginatorModule,
        BreadcrumbModule,
        SharedModule
    ]
})
export class LandingCatalogueModule
{
}
