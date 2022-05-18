import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Error500Service
{
    private _show500$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _errorMessage$: BehaviorSubject<string | null> = new BehaviorSubject<string>(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    /**
     * Getter for show error 500
     */
    get show500$(): Observable<boolean>
    {
        return this._show500$.asObservable();
    }

    /**
     * Getter for error 500 message
     */
     get errorMessage$(): Observable<string>
     {
         return this._errorMessage$.asObservable();
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the error 500
     */
    show(message: string = null): void
    {        
        this._show500$.next(true);
        this._errorMessage$.next(message)
    }

    /**
     * Hide the error 500
     */
    hide(): void
    {
        this._show500$.next(false);
    }

}
