import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreFooterComponent } from 'app/shared/store-footer/store-footer.component';
import { StoreHeaderComponent } from 'app/shared/store-header/store-header.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        StoreFooterComponent,
        StoreHeaderComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StoreFooterComponent,
        StoreHeaderComponent
    ]
})
export class SharedModule
{
}
