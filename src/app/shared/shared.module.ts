import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreFooterComponent } from 'app/shared/store-footer/store-footer.component';

@NgModule({
    declarations: [
        StoreFooterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StoreFooterComponent
    ]
})
export class SharedModule
{
}
