import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, delay, retryWhen } from 'rxjs/operators';
import { JwtService } from 'app/core/jwt/jwt.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CartService } from 'app/core/cart/cart.service';
import { Error500Service } from './error-500/error-500.service';

export const retryCount = 3;
export const retryDelay = 1000;

@Injectable()
export class CoreInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _cartService: CartService,
        private _error500Service: Error500Service

    )
    {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        // Clone the request object
        let newReq = req.clone();

        // Response
        return next.handle(newReq).pipe(

            retryWhen(error => 
                error.pipe(
                  concatMap((error, count) => {

                    // set show error 500 page to false
                    this._error500Service.hide();

                    const substring =  String(error.status)[0]
                    
                    // retry 'retryCount' amount of times
                    if (count < retryCount && error instanceof HttpErrorResponse && (substring === '5' || error.status === 0)) {
                        
                        return of(error);
                    }

                    // when already retried 'retryCount' amount of times
                    else if (count === retryCount) {
                        // set show error 500 page to true
                        this._error500Service.show();
                    }

                    // Ignore intercept for login () clients/authenticate                
                    else if (error instanceof HttpErrorResponse && !(error.status === 401 && newReq.url.indexOf("customers/authenticate") > -1)  && !(error.status === 409))
                    {
                        // Show a error message
                        const confirmation = this._fuseConfirmationService.open({
                            title  : error.error.error ? 'Error ' + error.error.error + ' (' + error.error.status + ')': 'Error',
                            message: error.error.message ? error.error.message : error.message,
                            icon: {
                                show: true,
                                name: "heroicons_outline:exclamation",
                                color: "warn"
                            },
                            actions: {
                                confirm: {
                                    label: 'OK',
                                    color: "primary",
                                },
                                cancel: {
                                    show: false,
                                },
                            }
                        });
                        
                    }

                    // This function is to remove cartId from local storage is got error 404 from backend cart item
                    let regex = new RegExp('carts\/(.*)\/items')
                    if ( error instanceof HttpErrorResponse && error.status === 404 && newReq.url.match(regex)) {
                        this._cartService.cartId = '';
                        // Reload the app
                        location.reload();
                    }

                    return throwError(error);
                  }),

                  // delay the retry
                  delay(retryDelay)
                )
            ),
        );
    }
}
