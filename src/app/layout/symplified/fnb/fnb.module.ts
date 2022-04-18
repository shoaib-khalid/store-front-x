import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FnbLayoutComponent } from 'app/layout/symplified/fnb/fnb.component';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';
import { FuseAlertModule } from '@fuse/components/alert';
import { DatePipe } from '@angular/common';
import { BannerModule } from 'app/layout/common/banner/banner.module';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { MatButtonModule } from '@angular/material/button';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';

@NgModule({
    declarations: [
        FnbLayoutComponent,
    ],
    imports     : [
        RouterModule,
        SharedModule,
        BreadcrumbModule,
        MatIconModule,
        FuseAlertModule,
        BannerModule,
        FuseDrawerModule,
        MatButtonModule,
        FuseLoadingBarModule
    ],
    exports     : [
        FnbLayoutComponent,
    ],
    providers   : [
        DatePipe
    ]
})
export class FnbLayoutModule
{
}
