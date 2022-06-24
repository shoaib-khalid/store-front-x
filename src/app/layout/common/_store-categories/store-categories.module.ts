import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { _StoreCategoriesSideComponent } from './side-placement/store-categories-side.component';
import { _StoreCategoriesTopComponent } from './top-placement/store-categories-top.component';

@NgModule({
    declarations: [
        _StoreCategoriesSideComponent,
        _StoreCategoriesTopComponent
    ],
    imports     : [
        RouterModule.forChild([]),
        SharedModule,
        MatIconModule,
        MatCheckboxModule
    ],
    exports     : [
        _StoreCategoriesSideComponent,
        _StoreCategoriesTopComponent
    ]
})
export class _StoreCategoriesModule
{
}
