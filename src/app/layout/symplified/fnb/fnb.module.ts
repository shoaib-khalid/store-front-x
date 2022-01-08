import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FnbLayoutComponent } from 'app/layout/symplified/fnb/fnb.component';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';

@NgModule({
    declarations: [
        FnbLayoutComponent
    ],
    imports     : [
        RouterModule,
        SharedModule,
        BreadcrumbModule,
        MatIconModule
    ],
    exports     : [
        FnbLayoutComponent
    ]
})
export class FnbLayoutModule
{
}
