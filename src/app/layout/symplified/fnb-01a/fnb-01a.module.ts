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
import { Fnb01aLayoutComponent } from 'app/layout/symplified/fnb-01a/fnb-01a.component';
import { BreadcrumbModule } from 'app/layout/common/breadcrumb/breadcrumb.module';
import { MarqueeModule } from 'app/layout/common/marquee/marquee.module';
import { FooterModule } from 'app/layout/common/footer/footer.module';
import { FloatingMessageModule } from 'app/layout/common/_floating-message/floating-message.module';
import { DatePipe } from '@angular/common';
import { DisplayErrorModule } from 'app/layout/common/_display-error/display-error.module';

@NgModule({
    declarations: [
        Fnb01aLayoutComponent
    ],
    imports     : [
        HttpClientModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        BreadcrumbModule,
        DisplayErrorModule,
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
        FooterModule,
        CartModule,
        SharedModule,
        MarqueeModule,
        FloatingMessageModule
    ],
    exports     : [
        Fnb01aLayoutComponent
    ],
    providers   : [
        DatePipe
    ]
})
export class Fnb01aLayoutModule
{
}
