import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'choose-delivery-address',
  templateUrl: './choose-delivery-address.component.html'
})
export class ChooseDeliveryAddressComponent implements OnInit {

  showButton: boolean = false;
  addresses: string[];
  selectedAddressId: string;

  constructor(
    private dialogRef: MatDialogRef<ChooseDeliveryAddressComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.addresses = this.data.customerAddress.map(item => {
      return { 
        id: item.id, 
        displayAddress: item.address + " " + item.city + " " + item.postCode + " " + item.state + " " + item.country
      }
    });

    if (this.addresses.length === 1) {
      this.selectedAddressId = this.addresses[0]["id"];
    }

  }

  cancel() {
    this.dialogRef.close({isAddress: false});
  }

  chooseAddress() {

    let _addresses = this.data.customerAddress;
    let index = _addresses.findIndex(item => item.id === this.selectedAddressId);
    
    if (index > -1) {
      const address = _addresses[index];
      address["isAddress"] = true;
      this.dialogRef.close(address);
    } else {
      this.dialogRef.close({isAddress: false});
    }
  }

}
