import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { environment } from 'environments/environment';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';

@Component({
    selector     : 'marketplace-layout',
    templateUrl  : './marketplace.component.html',
    encapsulation: ViewEncapsulation.None
})
export class MarketplaceLayoutComponent implements OnInit, OnDestroy
{
    user: User;
    store: Store;
    
    isScreenSmall: boolean;
    navigation: Navigation;

    headerTitle: string;
    displayUsername: string ='';

    public version: string = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    platform: Platform;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _platformsService: PlatformService

    )
    {
        this.headerTitle = this.getHeaderTitle(this._activatedRoute.root); 
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
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
            this.headerTitle = this.getHeaderTitle(this._activatedRoute.root);
        });

        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {
                this.store = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                
                this.navigation = navigation;
                let navigationObjectIndex =  navigation.default.findIndex(item => item.id === 'product-categories' )
                this._storesService.storeCategories$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((categories: any) => {
                        
                        this.navigation.default[navigationObjectIndex].children = [
                            {
                                id: 'all-products',
                                title: 'All Products',
                                type: "basic",
                                exactMatch: true,
                                link : '/catalogue/all-products',
                                function: ()=> this.reload(),
                                
                            }
                        ];
                        categories.forEach(category => {
                            let categorySlug = this.getCategorySlug(category.name)
                            this.navigation.default[navigationObjectIndex].children.push( 
                                {
                                    id: categorySlug,
                                    title: category.name,
                                    type: "basic",
                                    exactMatch: true,
                                    link : '/catalogue/' + categorySlug,
                                    function: ()=> this.reload()
                                } 
                             ) 
                        })
                    });
            });


        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
                this.displayUsername = this.textTruncate(user.name, 12)

            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get Header Title
     *
     * @param route
     */
    getHeaderTitle(route: ActivatedRoute) : string
    {
        //If no routeConfig is avalailable we are on the root path
        let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.headerTitle : '';
        let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';     

        // If the route is dynamic route such as ':id', remove it
        const lastRoutePart = path.split('/').pop();
        const isDynamicRoute = lastRoutePart.startsWith(':');
        if(isDynamicRoute && !!route.snapshot && route.routeConfig.data.headerTitle) {
            const paramName = lastRoutePart.split(':')[1];
            path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
            label = route.snapshot.params[paramName];
        }

        // Only adding route with non-empty label
        const labelName: string =  label ? label : '';
  
        if (route.firstChild) {
            //If we are not on our current path yet,
            //there will be more children to look after, to build our breadcumb
            return this.getHeaderTitle(route.firstChild);
        }

        return labelName;
    }

    getCategorySlug(categoryName: string) {
        return categoryName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    textTruncate(str, length, ending?:any){
        if (length == null) {
            length = 100;
          }
          if (ending == null) {
            ending = '...';
          }
          if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
          } else {
            return str;
          }  
    }

}
