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
        // v0.0.22
        {
            version    : 'v0.0.22',
            releaseDate: 'Feb 18, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCataloguePage) Fix description cut off',
                        '(LandingCheckoutPage) Disable opening from SF store timings if store have no opening',
                        '(LandingCataloguePage) Fix item image flickers'
                    ]
                }
            ]
        },
        // v0.0.21
        {
            version    : 'v0.0.21',
            releaseDate: 'Feb 17, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(SafariProblems) Fix safari issue'
                    ]
                }
            ]
        },
        // v0.0.20
        {
            version    : 'v0.0.20',
            releaseDate: 'Feb 16, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCataloguePage) Flicking issue',
                        '(Footer) Temporary remove adress',
                    ]
                }
            ]
        },
        // v0.0.19
        {
            version    : 'v0.0.19',
            releaseDate: 'Feb 14, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCheckoutPage) Fix checkout product image',
                    ]
                }
            ]
        },
        // v0.0.18
        {
            version    : 'v0.0.18',
            releaseDate: 'Feb 12, 2022',
            changes    : [
                {
                    type: 'Add',
                    list: [
                        '(DynamicFavicon) Load favicon from backend',
                        '(MultipleBanner) Load banners from backend',
                    ]
                }
            ]
        },
        // v0.0.17
        {
            version    : 'v0.0.17',
            releaseDate: 'Feb 11, 2022',
            changes    : [
                {
                    type: 'Add',
                    list: [
                        '(LandingCataloguePage) Mark product out of stock as gray'
                    ]
                }
            ]
        },
        // v0.0.16
        {
            version    : 'v0.0.16',
            releaseDate: 'Feb 10, 2022',
            changes    : [
                {
                    type: 'Remove',
                    list: [
                        '(AllPages) Remove back button'
                    ]
                },
                {
                    type: 'Fix',
                    list: [
                        '(ProductLandingPage) Remove first meta data description',
                        '(MobileView) Fix Mobile view to match figma',
                        '(CatalogueLandingPage) Fix pagination when selecting other catagory'
                    ]
                }
            ]
        },
        // v0.0.15
        {
            version    : 'v0.0.15',
            releaseDate: 'Feb 04, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(Favicon) Add DeliverIn FavIcon'
                    ]
                },
                {
                    type: 'Fix',
                    list: [
                        '(ProductLandingPage) Restrict number of items to be less than 3 digits. (maximum 999)',
                    ]
                }
            ]
        },
        // v0.0.14
        {
            version    : 'v0.0.14',
            releaseDate: 'Feb 03, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(GoogleAnalytics) Add Analytics Code',
                        '(ProductLandingPage) Add meta for description for product is exists',
                    ]
                },
                {
                    type: 'Fix',
                    list: [
                        '(PaymentRedirectionPage) Fix Payment Redirection Page',
                    ]
                }
            ]
        },
        // v0.0.13
        {
            version    : 'v0.0.13',
            releaseDate: 'Jan 28, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(ProductDiscount) Add product discount',
                    ]
                },
                {
                    type: 'Fix',
                    list: [
                        '(LandingCataloguePage) Fix pagination',
                        '(LandingCataloguePage) Fix sorting'
                    ]
                }
            ]
        },
        // v0.0.12
        {
            version    : 'v0.0.12',
            releaseDate: 'Jan 25, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(Favicon) Dynamic favicon from storevertical types',
                        '(StoreTitle) Dynamic store webapp title',
                    ]
                },
                {
                    type: 'Fix',
                    list: [
                        '(Footer) Fix footer version',
                        '(LandingHomePage) Fix Category responsiveness',
                        '(LandingProductPage) Remove product discount percentage & strikethrough price',
                        '(LandingCataloguePage) Remove product discount percentage & strikethrough price'
                    ]
                }
            ]
        },
        // v0.0.11
        {
            version    : 'v0.0.11',
            releaseDate: 'Jan 24, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCheckoutPage) Fix service charges',
                        '(LandingCheckoutPage) Fix UI, remove icon, fix store timing UI',
                    ]
                }
            ]
        },
        // v0.0.10
        {
            version    : 'v0.0.10',
            releaseDate: 'Jan 23, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingHomePage) Fix category',
                        '(LandingHomePage) Fix discount slider',
                        '(LandingCataloguePage) Fix icons',
                        '(LandingProductPage) Fix image gallery',
                        '(LandingCheckoutPage) Fix checkout image thumbnail',
                        '(Footer) Fix responsive',
                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(LandingCheckoutPage) Add store closing UI',
                        '(NotificationBanner) Add store closing UI',
                        '(PaymentRedirect) Add store payment completion function',
                        '(ThankYouPage) Add thankyou page UI',
                    ]
                }
            ]
        },
        // v0.0.9
        {
            version    : 'v0.0.9',
            releaseDate: 'Jan 13, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingProductPage) Fix checkout button',
                        '(AppResolver) Fix hardcode store url'
                    ]
                }
            ]
        },
        // v0.0.8
        {
            version    : 'v0.0.8',
            releaseDate: 'Jan 13, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(LandingCataloguePage) Fix sort product',
                        '(LandingCheckoutPage) Fix payment details, get data from backend',
                        '(AppResolver) Fix hardcode store url'
                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(LandingCheckoutPage) Implement online payment functionality',
                        '(LandingCheckoutPage) Implement place order functionality',
                        '(ThankyouPage) Create dummy thankyou page',
                    ]
                }
            ]
        },
        // v0.0.7
        {
            version    : 'v0.0.7',
            releaseDate: 'Jan 11, 2022',
            changes    : [
                {
                    type: 'Fix',
                    list: [
                        '(ProductService) Fix get products to support pagination based on category id',
                        '(CataloguePage) Remove top navigation bar in catalogue page',
                        '(FnBLayout) Fix no store page, add 404 if no store at backend',
                        '(FnBLayout) Fix checkout logo design from outline to fill',
                        '(DiscountSlider) Fix discount slider if there\'s no store discount at backend',

                    ]
                },
                {
                    type: 'Added',
                    list: [
                        '(CataloguePage) Implement search product',
                        '(CoreInterceptor) Add default popup if any error from backend',
                        '(CheckoutPage) Add choose delivery provider popup',
                        '(CheckoutPage) Add input validation for checkout form',
                        '(CheckoutPage) Integrate with delivery service to get price',
                        '(CheckoutPage) Integrate with order service to get discount price',
                        '(CheckoutPage) Implement order discount capped, delivery discount capped',
                        '(ProductPage) Show no product if no product from backend'
                    ]
                }
            ]
        },
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
