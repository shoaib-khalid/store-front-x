import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { OrderListComponent } from './order-list/order-list.component';
import { orderRoutes } from './order.routing';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderInvoiceComponent } from './order-invoice/order-invoice.component';



@NgModule({
    declarations: [
        OrderListComponent,
        OrderDetailsComponent,
        OrderInvoiceComponent
    ],
    imports     : [
        RouterModule.forChild(orderRoutes),
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatMenuModule,
        PaginationModule,
        SharedModule

    ]
})
export class OrderModule 
{
}