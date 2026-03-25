import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MessageService } from 'primeng/api';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { apiConfigurationProvider } from './core/providers/api-config.provider';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { SharedModule } from './shared/shared.module';
import { layoutReducer } from './store/layout/layout.reducer';
import { TestDialogPageComponent } from './test-dialog-page/test-dialog-page.component';
import { TestDashboardOverviewComponent } from './test-dashboard-overview/test-dashboard-overview.component';
import { TestSalesReportComponent } from './test-sales-report/test-sales-report.component';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';

const AppPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '{orange.500}',
      600: '{orange.600}',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}',
    },
  },
});

@NgModule({
  declarations: [
    AppComponent,
    TestDialogPageComponent,
    TestDashboardOverviewComponent,
    TestSalesReportComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    StoreModule.forRoot({ layout: layoutReducer }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    BaseChartDirective,
  ],
  providers: [
    // API Configuration - Sets base URL from environment
    apiConfigurationProvider,
    // PrimeNG Configuration
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: false,
        },
      },
      translation: {
        dayNames: [
          'อาทิตย์',
          'จันทร์',
          'อังคาร',
          'พุธ',
          'พฤหัสบดี',
          'ศุกร์',
          'เสาร์',
        ],
        dayNamesShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        monthNames: [
          'มกราคม',
          'กุมภาพันธ์',
          'มีนาคม',
          'เมษายน',
          'พฤษภาคม',
          'มิถุนายน',
          'กรกฎาคม',
          'สิงหาคม',
          'กันยายน',
          'ตุลาคม',
          'พฤศจิกายน',
          'ธันวาคม',
        ],
        monthNamesShort: [
          'ม.ค.',
          'ก.พ.',
          'มี.ค.',
          'เม.ย.',
          'พ.ค.',
          'มิ.ย.',
          'ก.ค.',
          'ส.ค.',
          'ก.ย.',
          'ต.ค.',
          'พ.ย.',
          'ธ.ค.',
        ],
        today: 'วันนี้',
        clear: 'ล้าง',
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 0,
      },
    }),
    // ng2-charts for test pages
    provideCharts(withDefaultRegisterables()),
    // PrimeNG MessageService (global singleton for Toast)
    MessageService,
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
