import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FooterComponent } from 'app/layout/common/footer/footer.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [
        FooterComponent
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        FooterComponent
    ]
})
export class FooterModule
{
}
