import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FnbLayoutComponent } from 'app/layout/symplified/fnb/fnb.component';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';
import { Error404Component } from 'app/shared/error/error-404/error-404.component';

@NgModule({
    declarations: [
        FnbLayoutComponent,
        Error404Component
    ],
    imports     : [
        RouterModule,
        SharedModule,
        BreadcrumbModule,
        MatIconModule,
    ],
    exports     : [
        FnbLayoutComponent,
        Error404Component
    ]
})
export class FnbLayoutModule
{
}
