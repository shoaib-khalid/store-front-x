import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PaginationComponent } from 'app/layout/common/pagination/pagination.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [
        PaginationComponent
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        PaginationComponent
    ]
})
export class PaginationModule
{
}
