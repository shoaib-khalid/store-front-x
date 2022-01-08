import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingCheckoutComponent } from 'app/modules/landing/checkout/checkout.component';
import { landingCheckoutRoutes } from 'app/modules/landing/checkout/checkout.routing';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
    declarations: [
        LandingCheckoutComponent
    ],
    imports     : [
        RouterModule.forChild(landingCheckoutRoutes),
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSlideToggleModule,
        SharedModule
    ]
})
export class LandingCheckoutModule
{
}
