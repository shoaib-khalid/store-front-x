import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseFullscreenModule } from '@fuse/components/fullscreen';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { LanguagesModule } from 'app/layout/common/languages/languages.module';
import { MessagesModule } from 'app/layout/common/messages/messages.module';
import { NotificationsModule } from 'app/layout/common/notifications/notifications.module';
import { QuickChatModule } from 'app/layout/common/quick-chat/quick-chat.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { ShortcutsModule } from 'app/layout/common/shortcuts/shortcuts.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { CartModule } from 'app/layout/common/cart/cart.module';
import { SharedModule } from 'app/shared/shared.module';
import { MarketplaceLayoutComponent } from 'app/layout/symplified/marketplace/marketplace.component';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';
import { Error404Component } from 'app/shared/error/error-404/error-404.component';
import { MarqueeModule } from 'app/layout/common/marquee/marquee.module';
import { Error500Component } from 'app/shared/error/error-500/error-500.component';

@NgModule({
    declarations: [
        MarketplaceLayoutComponent,
        Error404Component,
        Error500Component
    ],
    imports     : [
        HttpClientModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        BreadcrumbModule,
        FuseFullscreenModule,
        FuseLoadingBarModule,
        FuseNavigationModule,
        LanguagesModule,
        MessagesModule,
        NotificationsModule,
        QuickChatModule,
        SearchModule,
        ShortcutsModule,
        UserModule,
        CartModule,
        SharedModule,
        MarqueeModule
    ],
    exports     : [
        MarketplaceLayoutComponent
    ]
})
export class MarketplaceLayoutModule
{
}
