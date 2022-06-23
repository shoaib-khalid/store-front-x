import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { DisplayErrorService } from 'app/core/display-error/display-error.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'display-error',
    templateUrl    : './display-error.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayErrorComponent
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    error: {
        type: string;
        code: string;
        title: string;
        message: string;
    } = null;

    /**
     * Constructor
     */
    constructor(
        private _displayErrorService: DisplayErrorService,
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
        // Subscribe to show error message
        this._displayErrorService.errorMessage$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response) {
                    this.error = response;                    
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });   
    }
}
