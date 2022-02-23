import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { LandingCatalogueComponent } from 'app/modules/landing/catalogue/catalogue.component';
import { landingCatalogueRoutes } from 'app/modules/landing/catalogue/catalogue.routing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { SettingsModule } from 'app/layout/common/settings/settings.module';

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
        MatMenuModule,
        PaginationModule,
        SharedModule,
        SettingsModule
    ]
})
export class LandingCatalogueModule
{
}
