import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Error404Component } from 'app/shared/error/error-404/error-404.component';
import { error404Routes } from 'app/shared/error/error-404/error-404.routing';

@NgModule({
    declarations: [
        Error404Component
    ],
    imports     : [
        RouterModule.forChild(error404Routes),
        MatIconModule
    ],
    exports: [
        Error404Component
    ]
})
export class Error404Module
{
}
