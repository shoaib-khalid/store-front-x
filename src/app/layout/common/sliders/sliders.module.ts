import { NgModule } from '@angular/core';
import { SlidersComponent } from './sliders.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [
        SlidersComponent
    ],
    imports     : [
        SharedModule,

        // MatFormFieldModule,
        // MatSelectModule,
        // MatInputModule,
        // MatTooltipModule,
        
        MatTabsModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,
        MatSlideToggleModule,
    ],
    exports     : [
        SlidersComponent
    ]
})
export class SlidersModule
{
}
