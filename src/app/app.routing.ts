import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver, StoreResolver } from 'app/app.resolvers';
import { CartItemsResolver, StoreCategoriesResolver } from './modules/landing/landing.resolver';
import { UserRole } from './core/user/user.types';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'home'},

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: '/buyer/buyerexample'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        data: {
            layout: 'fnb'
        },
        resolve    : {
            storeInfo: StoreResolver
        },
        children   : [
            {path: 'home', resolve: { cartItems: CartItemsResolver }, loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'catalogue', resolve: { cartItems: CartItemsResolver }, data: { breadcrumb: 'Catalogue' }, loadChildren: () => import('app/modules/landing/catalogue/catalogue.module').then(m => m.LandingCatalogueModule)},
            {path: 'product', resolve: { cartItems: CartItemsResolver }, data: { breadcrumb: 'Product' }, loadChildren: () => import('app/modules/landing/product-details/product-details.module').then(m => m.LandingProductDetailsModule)},
            {path: 'checkout', resolve: { cartItems: CartItemsResolver }, data: { breadcrumb: 'Checkout' }, loadChildren: () => import('app/modules/landing/checkout/checkout.module').then(m => m.LandingCheckoutModule)},
            {path: 'thankyou', resolve: { cartItems: CartItemsResolver }, data: { breadcrumb: 'Thankyou' }, loadChildren: () => import('app/modules/landing/thankyou/thankyou.module').then(m => m.LandingThankyouModule)},
            {path: 'payment-redirect', resolve: { cartItems: CartItemsResolver }, data: { layout: 'empty', breadcrumb: 'Payment Redirect' }, loadChildren: () => import('app/modules/landing/payment-redirect/payment-redirect.module').then(m => m.LandingPaymentRedirectModule)}
        ]
    },

    // Buyer routes
    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        data: {
            layout: 'empty',
            roles: [UserRole.Customer]
        },
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            {path: '', loadChildren: () => import('app/modules/buyer/buyer.module').then(m => m.BuyerModule)},
        ]
    },

    // Admin routes
    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
        ]
    },

    // Documentation
    {
        path: 'docs',
        children: [
            // Changelog
            {path: 'changelog', loadChildren: () => import('app/modules/admin/docs/changelog/changelog.module').then(m => m.ChangelogModule)}
        ]
    },
];
