import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd  } from '@angular/router';
import { IBreadCrumb } from './breadcrumb.types';
import { filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { Store } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';
import { Subject } from 'rxjs';

@Component({
    selector       : 'breadcrumb',
    templateUrl    : './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit
{

    public breadcrumbs: IBreadCrumb[]
    private store: Store;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _storesService: StoresService,
        private _platformLocation: PlatformLocation,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {        
        this.breadcrumbs = this.buildBreadCrumb(this._activatedRoute.root);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe(() => {
            this.breadcrumbs = this.buildBreadCrumb(this._activatedRoute.root);            
        });

        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((store: Store)=>{
                if (store) {
                    this.store = store;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Recursively build breadcrumb according to activated route.
     * @param route
     * @param url
     * @param breadcrumbs
     */
    buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {
        //If no routeConfig is avalailable we are on the root path
        let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : '';
        let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';        

        // If the route is dynamic route such as ':id', remove it
        const lastRoutePart = path.split('/').pop();
        const isDynamicRoute = lastRoutePart.startsWith(':');
        if(isDynamicRoute && !!route.snapshot) {
            const paramName = lastRoutePart.split(':')[1];
            path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
            label = route.snapshot.params[paramName];
        }

        //In the routeConfig the complete path is not available,
        //so we rebuild it each time
        const nextUrl = path ? `${url}/${path}` : url;

        const breadcrumb: IBreadCrumb = {
            label: label,
            url: nextUrl,
        };

        // Only adding route with non-empty label
        const newBreadcrumbs = breadcrumb.label ? [ ...breadcrumbs, breadcrumb ] : [ ...breadcrumbs];
        if (route.firstChild) {
            //If we are not on our current path yet,
            //there will be more children to look after, to build our breadcumb
            return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
        }
        return newBreadcrumbs;
    }

    goToHome()
    {
        // ----------------------
        // Get store by URL
        // ----------------------

        let fullUrl = (this._platformLocation as any).location.origin;
        let domain = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL

        let domainNameArr = domain.split('.'); domainNameArr.shift();
        let domainName = domainNameArr.join("."); 
        let subDomainName = domain.split('.')[0];
                
        if (subDomainName === "payment") {
            let homeUrl = "https://" + this.store.domain;
            this._document.location.href = homeUrl;
        } else {
            this._router.navigate(['']);
        }
    }

}
