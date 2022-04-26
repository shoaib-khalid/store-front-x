import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingCheckoutComponent } from 'app/modules/landing/checkout/checkout.component';
import { landingCheckoutRoutes } from 'app/modules/landing/checkout/checkout.routing';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ChooseDeliveryAddressComponent } from './choose-delivery-address/choose-delivery-address.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { AddAddressComponent } from './add-address/add-address.component';
import { EditAddressComponent } from './edit-address/edit-address.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { VoucherModalComponent } from './voucher-modal/voucher-modal.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
    declarations: [
        LandingCheckoutComponent,
        ChooseDeliveryAddressComponent,
        ModalConfirmationDeleteItemComponent,
        AddAddressComponent,
        EditAddressComponent,
        VoucherModalComponent
    ],
    imports     : [
        RouterModule.forChild(landingCheckoutRoutes),
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDialogModule,
        MatRadioModule,
        SharedModule,
        MatExpansionModule,
        AgmCoreModule.forRoot({  
            apiKey: 'AIzaSyCFhf1LxbPWNQSDmxpfQlx69agW-I-xBIw' ,
            libraries: ['places'] 
          }), 
    ],
    providers   : [
        DatePipe
    ]
})
export class LandingCheckoutModule
{
}
