import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FnbLayoutComponent } from 'app/layout/symplified/fnb/fnb.component';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';
import { Error404Module } from 'app/shared/error/error-404/error-404.module';

@NgModule({
    declarations: [
        FnbLayoutComponent
    ],
    imports     : [
        RouterModule,
        SharedModule,
        BreadcrumbModule,
        MatIconModule,
        Error404Module
    ],
    exports     : [
        FnbLayoutComponent
    ]
})
export class FnbLayoutModule
{
}
