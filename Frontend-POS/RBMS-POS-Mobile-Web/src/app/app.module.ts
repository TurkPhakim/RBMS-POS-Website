import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from '@shared/shared.module';

import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { definePreset } from '@primeng/themes';
import { provideApiConfig } from '@core/providers/api-config.provider';
import { CustomerTokenInterceptor } from '@core/interceptors/customer-token.interceptor';
import { LoadingInterceptor } from '@core/interceptors/loading.interceptor';

import { AuthComponent } from './pages/auth/auth.component';
import { ExpiredComponent } from './pages/expired/expired.component';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';

const RbmsPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50:  '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
  },
});

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    ExpiredComponent,
    CustomerLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    provideApiConfig(),
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CustomerTokenInterceptor, multi: true },
    providePrimeNG({
      theme: {
        preset: RbmsPreset,
        options: { darkModeSelector: false },
      },
      translation: {
        dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
        dayNamesShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        monthNames: [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
          'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
          'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
        ],
        monthNamesShort: [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
          'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
          'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
        ],
        today: 'วันนี้',
        clear: 'ล้าง',
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
