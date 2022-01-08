import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Error500Component } from 'app/shared/error/error-500/error-500.component';
import { error500Routes } from 'app/shared/error/error-500/error-500.routing';

@NgModule({
    declarations: [
        Error500Component
    ],
    imports     : [
        RouterModule.forChild(error500Routes)
    ],
    exports: [
        Error500Component
    ]
})
export class Error500Module
{
}
