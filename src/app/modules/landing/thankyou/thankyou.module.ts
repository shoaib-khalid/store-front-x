import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { LandingThankyouComponent } from 'app/modules/landing/thankyou/thankyou.component';
import { landingThankyouRoutes } from 'app/modules/landing/thankyou/thankyou.routing';

@NgModule({
    declarations: [
        LandingThankyouComponent,
    ],
    imports     : [
        RouterModule.forChild(landingThankyouRoutes),
        SharedModule
    ]
})
export class LandingThankyouModule
{
}
