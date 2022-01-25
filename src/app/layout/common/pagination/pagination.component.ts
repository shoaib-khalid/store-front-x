import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'pagination',
    templateUrl    : './pagination.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'pagination'
})
export class PaginationComponent implements OnInit, OnDestroy
{
    currentPageIndex: number;
    currentPage: number;

    previousPage: number;
    nextPage: number;

    isLastPage: any;
    isFirstPage: any;

    paginationArray: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.paginationArray = new Array(10);

        this.currentPageIndex = 0;

        this.previousPage = 0;
        this.nextPage = 9;

        this.isFirstPage = true;
        this.isLastPage = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    setPagination(length: number, pageIndex: number, pageSize: number, totalPages: number, pageSizeOptions: 5 | 10 | 25 | 100, showFirstLastButtons: boolean ) {
        this.currentPageIndex = pageSize;
        this.currentPage = pageIndex;


        this.paginationArray = new Array(totalPages);
    }

    goToPrev(pageNo){

        this.currentPageIndex = pageNo - 1;
        this.checkPagination();

        // this.getProduct(this.catId ,this.sortBy)
        // alert(goToPrev)
    }

    goToNext(pageNo){
        this.currentPageIndex = pageNo + 1;
        this.checkPagination();

        // this.getProduct(this.catId ,this.sortBy)
        // alert(goToNext)
    }

    goToPage(pageNo){

        this.currentPageIndex = pageNo;
        this.checkPagination();

        // this.getProduct(this.catId ,this.sortBy)
    }

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

    checkPagination() {
        
        // disable first page if current page index less that 0
        (this.currentPageIndex > this.previousPage) ? this.isFirstPage = false : this.isFirstPage = true;

        // disable last page if current page index more that nextPage
        (this.currentPageIndex < this.nextPage) ? this.isLastPage = false : this.isLastPage = true;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
