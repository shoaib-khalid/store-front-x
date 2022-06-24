import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { _StoreProductsComponent } from './store-products.component';

@NgModule({
    declarations: [
        _StoreProductsComponent
    ],
    imports     : [
        RouterModule.forChild([]),
        SharedModule
    ],
    exports     : [
        _StoreProductsComponent
    ]
})
export class _StoreProductsModule
{
}
