import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

declare let gtag: Function;
@Component({
  selector: 'modal-confirmation-delete-item',
  templateUrl: './modal-confirmation-delete-item.component.html',
})
export class ModalConfirmationDeleteItemComponent implements OnInit {
  
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  cartId :string ='';
  cartItem : CartItem;
  store: Store

  constructor(
    private dialogRef: MatDialogRef<ModalConfirmationDeleteItemComponent>,
    private _cartService: CartService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _storesService: StoresService,
  ) { }

  ngOnInit(): void {
    this.cartId = this.data['cartId'];
    this.cartItem = this.data['cartItem'];

    this._storesService.store$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: Store) => {
        this.store = response;
      })

  }

  cancelButton() {
    this.dialogRef.close();
  }

  deleteButton() {
    this._cartService.deleteCartItem(this.cartId, this.cartItem.id)
        .subscribe((response)=>{
          if (this.store.googleAnalyticId) {
            gtag("event", "remove_from_cart", {
              items: [
                {
                  id: this.cartItem.productId,
                  name: this.cartItem.productName,
                  quantity: this.cartItem.quantity,
                  price: this.cartItem.price
                }
              ]
            })
          }
          this.dialogRef.close();
        });
  }

}
