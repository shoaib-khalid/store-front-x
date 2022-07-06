import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { _StoreLogoComponent } from './store-logo.component';

@NgModule({
    declarations: [
        _StoreLogoComponent
    ],
    imports     : [
        RouterModule,
        CommonModule,
        MatIconModule
    ],
    exports: [
        _StoreLogoComponent
    ]
})
export class _StoreLogoModule
{
}
