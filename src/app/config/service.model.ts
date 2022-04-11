export interface IAppConfig {
    env: {
        name            : string;
        impersonate     : boolean;
        impersonateUrl  : string;
    };
    apiServer: {
        flowBuilderService  : string;
        userService         : string;
        productService      : string;
        orderService        : string;
        reportService       : string;
        deliveryService     : string;
        paymentService      : string;
        analyticService     : string;

    };
    storeFrontDomain        : string;
    merchantPortalDomain    : string;
    marketplaceDomain       : string;
    logging                 : number;
}