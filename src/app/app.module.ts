import {BrowserModule, Title} from '@angular/platform-browser';
import {forwardRef, NgModule, Provider} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {NgSelectModule} from '@ng-select/ng-select';
import {routing} from './app.routing';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {APP_CONFIG, APP_DI_CONFIG} from '../constants/app-constants';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CalendarModule, DialogModule, DropdownModule, MessageModule, MessagesModule, RadioButtonModule, ToastModule} from 'primeng';
import {AuthenticationService} from '../services/authentication.service';
// import { OAuthService, OAuthModule, UrlHelperService } from 'angular-oauth2-oidc';
import {BASE_PATH, OAUTH_PROVIDER_URL} from './variables';
import {environment} from '../environments/environment';
import {ApiInterceptor} from './interceptors/api.interceptor';
import {ApiRequestConfiguration} from './interceptors/api.request.configuration';
// import { ApiConfiguration } from '../api/api-configuration';
import {CommonService} from '../services/common.service';
import {LoginComponent} from './components/login/login.component';
import {HomeComponent} from './components/home/home.component';
import {ApiModule} from '../api/api.module';
import {DataService} from '../services/data.service';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TooltipModule} from 'primeng/tooltip';

import {NgxEchartsModule} from 'ngx-echarts';
import {HeaderComponent} from './shared/components/header/header.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {AboutComponent} from './components/about/about.component';
import {DatePipe} from '@angular/common';
import {MdePopoverModule} from '@material-extended/mde';
import {SenatorInfoComponent} from './components/senator-info/senator-info.component';
import {FieldsetModule} from 'primeng/fieldset';
import {ChartModule} from 'angular2-highcharts';
import {HighchartsStatic} from 'angular2-highcharts/dist/HighchartsService';
import {AnalyticsComponent} from './components/analytics/analytics.component';
import {IssuerInfoComponent} from './components/issuer-info/issuer-info.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {NumberSuffixPipe} from './customPipe/number-suffix.pipe';
import {SideNavBarComponent} from './shared/components/side-nav-bar/side-nav-bar.component';
import {CommitteeComponent} from './components/committee/committee.component';

import {NumberOfTradesTableComponent} from './shared/components/number-of-trades-table/number-of-trades-table.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ShowIfEllipsisDirective} from './customDirectives/show-if-ellipsis.directive';
import {MultiSelectModule} from 'primeng/multiselect';
import {LayoutModule} from '@angular/cdk/layout';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {SplitPipe} from './customPipe/split-value.pipe';
import {ChangeValPipe} from './customPipe/change-value.pipe';
import {SplitPipeForIssuer} from './customPipe/split-issuer-value.pipe';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ConvertShareRangePipe} from './customPipe/convert-share-range.pipe';
import {MatRadioModule} from '@angular/material/radio';
import {ChangeTradeTypePipe} from './customPipe/change-trade-type.pipe';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RemovedSpacesFromStringPipe } from './customPipe/removed-spaces-from-string.pipe';
import { CommentsConvertPipe } from './customPipe/comments-convert.pipe';
import { FiltersComponent } from './shared/components/filters/filters.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BannerComponent } from './components/banner/banner.component';
declare var require: any;
export const API_INTERCEPTOR_PROVIDER: Provider = {
    provide: HTTP_INTERCEPTORS,
    useExisting: forwardRef(() => ApiInterceptor),
    multi: true,
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        HeaderComponent,
        AboutComponent,
        FooterComponent,
        SenatorInfoComponent,
        AnalyticsComponent,
        IssuerInfoComponent,
        NumberSuffixPipe,
        SplitPipe,
        SplitPipeForIssuer,
        ChangeValPipe,
        SideNavBarComponent,
        CommitteeComponent,
        NumberOfTradesTableComponent,
        ShowIfEllipsisDirective,
        ConvertShareRangePipe,
        ChangeTradeTypePipe,
        NumberSuffixPipe,
        NotFoundComponent,
        RemovedSpacesFromStringPipe,
        CommentsConvertPipe,
        FiltersComponent,
        BannerComponent
    ],
    imports: [
        BrowserModule,
        RouterModule,
        NgxEchartsModule,
        routing,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        NgSelectModule,
        ApiModule.forRoot({rootUrl: environment.apiUrl}),
        CalendarModule,
        ToastModule,
        MessageModule,
        MessagesModule,
        DropdownModule,
        FieldsetModule,
        ChartModule.forRoot(require('highcharts')),
        ProgressSpinnerModule,
        TooltipModule,
        NgxPaginationModule,
        RadioButtonModule,
        DialogModule,
        MdePopoverModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MultiSelectModule,
        LayoutModule,
        NgxDaterangepickerMd.forRoot(),
        MatSelectModule,
        MatExpansionModule,
        MatDividerModule,
        MatRadioModule,
        MatToolbarModule,
        MatChipsModule,
        MatNativeDateModule,
        MatDatepickerModule,
        NgxEchartsModule.forRoot({
            /**
             * This will import all modules from echarts.
             * If you only need custom modules,
             * please refer to [Custom Build] section.
             */
            echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
        }),
        MatProgressSpinnerModule,
        LazyLoadImageModule
    ],
    providers: [
        {provide: APP_CONFIG, useValue: APP_DI_CONFIG},
        AuthenticationService,
        // OAuthService,
        //   UrlHelperService,
        // ApiConfiguration,
        ApiInterceptor,
        API_INTERCEPTOR_PROVIDER,
        ApiRequestConfiguration,
        DataService,
        {provide: BASE_PATH, useValue: environment.apiUrl},
        {provide: OAUTH_PROVIDER_URL, useValue: environment.oauthProviderUrl},
        CommonService,
        {provide: HighchartsStatic, useFactory: highchartsFactory},
        Title,
        DatePipe
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}

export function highchartsFactory() {
    const hc = require('highcharts/highstock');
    const dd = require('highcharts/modules/exporting');
    dd(hc);
    return hc;
}
