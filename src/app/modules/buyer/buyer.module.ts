import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { buyerRoutes } from './buyer.routing';

@NgModule({
    declarations: [
    
    ],
    imports     : [
        RouterModule.forChild(buyerRoutes),
    ],
    bootstrap   : [
    ]
})
export class BuyerModule
{
}
