import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Meta, Title } from '@angular/platform-browser';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { CategoryPagination, Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { map, merge, Subject, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles       : [``]
})
export class LandingHomeComponent implements OnInit
{
    @ViewChild("categoryPaginator", {read: MatPaginator}) private _paginator: MatPaginator;

    platform: Platform;
    store: Store;
    storeCategories: StoreCategory[] = [];
    isLoading: boolean = false;

    pageOfItems: Array<any>;
    pagination: CategoryPagination;
    sortName: string = "name";
    sortOrder: 'asc' | 'desc' | '' = 'asc';
    searchName: string = "";

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _platformService: PlatformService,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _meta: Meta,
        private _titleService: Title
    )
    {
    }

    ngOnInit() {

        // Get platform data
        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform)=>{
                if (platform) {
                    this.platform = platform;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Get store data
        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storeResponse) => {
                if (storeResponse) {
                    this.store = storeResponse;
                    this._titleService.setTitle(this.store.name);
                    this._meta.addTag({property: "og:title", content: this.store.name})
                    this._meta.addTag({name: "description", content: this.store.storeDescription})
                    this._meta.addTag({property: "og:description", content: this.store.storeDescription})
                    this._meta.addTag({property: "og:image", content:  this.displayStoreLogo(this.store.storeAssets)})
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get store categories data
        this._storesService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response) {
                    this.storeCategories = response;                       
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the products pagination
        this._storesService.storeCategoryPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CategoryPagination) => {
                if (pagination) {
                    this.pagination = pagination;                   
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    
    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            if (this._paginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._storesService.getCategories("",this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.sortName, this.sortOrder);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;

        if( this.pagination && this.pageOfItems['currentPage']) {

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._storesService.getCategories("", this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.sortName, this.sortOrder)
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
            }
        }
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
}
