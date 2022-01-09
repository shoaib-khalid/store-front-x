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
        // v0.0.6
        {
            version    : 'v0.0.6',
            releaseDate: 'Jan 09, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(UIResponsive) Fix some UI responsiveness',
                        '(UIFunction) Fix some UI functions. Enable back button, cart button, breadcrumb navigation',
                        '(Layout) Make layout dynamic',
                        '(CataloguePage) Enable click product, make default image to store logo if product image null',
                        '(ProductPage) Enable product variants & product combo',
                        '(BannerSlider) Fix banner slider if there\'s no banner'
                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(CartService) Create add to cart function, count quantity of cart item and display in header',
                        '(DefaultPage) Add 404 page if there\'re no store'
                    ]
                }
            ]
        },
        // v0.0.5
        {
            version    : 'v0.0.5',
            releaseDate: 'Jan 09, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(Layout) Implement layout',
                        '(LandingCheckoutPage) Implement checkout functionality'
                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(Breadcrumb) Add breadcrumb funtionality'
                    ]
                }
            ]
        },
        // v0.0.4
        {
            version    : 'v0.0.4',
            releaseDate: 'Jan 07, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCataloguePage) Add category navigation',
                        '(LandingCataloguePage) Implement functionality',
                        '(LandingProductPage) Implement functionality'
                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(LandingCataloguePage) Add list view'
                    ]
                }
            ]
        },
        // v0.0.3
        {
            version    : 'v0.0.3',
            releaseDate: 'Jan 05, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(StoreBanner) Load Banner from backend',
                    ]
                }
            ]
        },
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
