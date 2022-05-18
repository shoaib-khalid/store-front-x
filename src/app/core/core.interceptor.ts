import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, takeUntil, delay, retryWhen, concatMap } from 'rxjs/operators';
import { JwtService } from 'app/core/jwt/jwt.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CartService } from 'app/core/cart/cart.service';
import { Router, RoutesRecognized } from '@angular/router';
import { Store } from './store/store.types';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AnalyticService } from './analytic/analytic.service';
import { IpAddressService } from './ip-address/ip-address.service';
import { CookieService } from 'ngx-cookie-service';
import { StoresService } from './store/store.service';
import { AppConfig } from 'app/config/service.config';
import { Customer, User } from './user/user.types';
import { Error500Service } from './error-500/error-500.service';

export const retryCount = 3;
export const retryDelay = 1000;

@Injectable()
export class CoreInterceptor implements HttpInterceptor
{
    store      : Store = null;
    ownerId    : string;
    ipAddress  : string; 
    deviceInfo = null;
    _event     : string;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _cartService: CartService,
        private _router: Router,
        private _deviceService: DeviceDetectorService,
        private _analyticService: AnalyticService,
        private _ipAddressService: IpAddressService,
        private _storesService: StoresService,
        private _cookieService: CookieService,
        private _error500Service: Error500Service,
        private _apiServer: AppConfig,

    )
    {
        // Get User IP Address
        this._ipAddressService.ipAdressInfo$
        .subscribe((response:any)=>{
            if (response) {
                this.ipAddress = response.ip_addr;                
            }
        });

        // Get current store
        this._storesService.store$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: Store)=>{ 
            this.store = response

        });

        //get customer id
        this.ownerId = this._cookieService.get('CustomerId');

        this._router.events.forEach((event) => {
            this._event = event["urlAfterRedirects"]
        })
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
                        
                        this._error500Service.show(this._apiServer.settings.logging === 0 ? error.message : null);
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

                        // get storeId
                        var _storeId = this.store.id;
                        // get customerId
                        var _customerId = this.ownerId

                        //get device info (browser info, os info, device nodel infp)
                        var device = this._deviceService.getDeviceInfo();
                        let _deviceBrowser = device.browser + ' ' + device.browser_version
                        let _deviceOs = device.os_version
                        let _deviceModel = device.deviceType + ' ' + device.device
                        
                        //get ip address info
                        var _IpService = this.ipAddress;

                        //get session id by get cart id
                        var _sessionId = this._cartService.cartId$ 

                        const activityBody = 
                        {
                            browserType : _deviceBrowser,
                            customerId  : _customerId? _customerId :null,
                            deviceModel : _deviceModel,
                            errorOccur  : "error " + error.error.error,
                            errorType   : "error " + error.error.status,
                            ip          : _IpService,
                            os          : _deviceOs,
                            pageVisited : this._event,
                            sessionId   : _sessionId,
                            storeId     : _storeId
                        }

                        this._analyticService.postActivity(activityBody)
                            .subscribe((response) => {
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
