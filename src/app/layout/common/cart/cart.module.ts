import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CartComponent } from 'app/layout/common/cart/cart.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [
        CartComponent
    ],
    imports     : [
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        CartComponent
    ]
})
export class CartModule
{
}
