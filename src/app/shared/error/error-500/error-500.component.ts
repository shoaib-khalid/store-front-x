import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Error500Service } from 'app/core/error-500/error-500.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'error-500',
    templateUrl    : './error-500.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error500Component
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    errorMessage: string = '';

    /**
     * Constructor
     */
    constructor(
        private _error500Service: Error500Service

    )
    {
        // Subscribe to show error message
        this._error500Service.errorMessage$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((any) => {
                this.errorMessage = any;
            });
    }
}
