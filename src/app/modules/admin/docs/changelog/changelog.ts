/* eslint-disable max-len */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector       : 'changelog',
    templateUrl    : './changelog.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogComponent
{
    changelog: any[] = [
        // v0.0.2
        {
            version    : 'v0.0.2',
            releaseDate: 'Jan 05, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(Changelog) Added the ChangeLog page',
                        '(LandingHomePage) Added the Landing Home Page',
                        '(LandingCataloguePage) Added the Landing Catalogue Page',
                        '(LandingCheckoutPage) Added the Landing Checkout Page',
                        '(LandingProductPage) Added the Landing Product Page'
                    ]
                }
            ]
        },
        // v13.6.0
        // {
        //     version    : 'v13.6.0',
        //     releaseDate: 'Aug 31, 2021',
        //     changes    : [
        //         {
        //             type: 'Added',
        //             list: [
        //                 '(QuickChat) Added the QuickChat bar'
        //             ]
        //         },
        //         {
        //             type: 'Changed',
        //             list: [
        //                 '(dependencies) Updated Angular & Angular Material to v12.2.3',
        //                 '(dependencies) Updated various other packages',
        //                 '(layout) Separated the Settings drawer from the layout component'
        //             ]
        //         },
        //         {
        //             type: 'Fixed',
        //             list: [
        //                 '(@fuse/drawer) Final opacity of the overlay is not permanent due to player being destroyed right after the animation'
        //             ]
        //         }
        //     ]
        // }
    ];

    /**
     * Constructor
     */
    constructor()
    {
    }
}
