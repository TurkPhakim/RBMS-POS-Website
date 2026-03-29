/* tslint:disable */
/* eslint-disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { AuthService } from './services/auth.service';
import { CashierSessionsService } from './services/cashier-sessions.service';
import { CustomerService } from './services/customer.service';
import { DashboardService } from './services/dashboard.service';
import { FileService } from './services/file.service';
import { FloorObjectsService } from './services/floor-objects.service';
import { HumanResourceService } from './services/human-resource.service';
import { KitchenService } from './services/kitchen.service';
import { MenuCategoriesService } from './services/menu-categories.service';
import { MenuItemsService } from './services/menu-items.service';
import { MenuOptionsService } from './services/menu-options.service';
import { NotificationsService } from './services/notifications.service';
import { OrdersService } from './services/orders.service';
import { PaymentsService } from './services/payments.service';
import { PositionsService } from './services/positions.service';
import { ReservationsService } from './services/reservations.service';
import { SelfOrderService } from './services/self-order.service';
import { ServiceChargesService } from './services/service-charges.service';
import { ShopSettingsService } from './services/shop-settings.service';
import { TablesService } from './services/tables.service';
import { UsersService } from './services/users.service';
import { ZonesService } from './services/zones.service';

/**
 * Module that provides all services and configuration.
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    AuthService,
    CashierSessionsService,
    CustomerService,
    DashboardService,
    FileService,
    FloorObjectsService,
    HumanResourceService,
    KitchenService,
    MenuCategoriesService,
    MenuItemsService,
    MenuOptionsService,
    NotificationsService,
    OrdersService,
    PaymentsService,
    PositionsService,
    ReservationsService,
    SelfOrderService,
    ServiceChargesService,
    ShopSettingsService,
    TablesService,
    UsersService,
    ZonesService,
    ApiConfiguration
  ],
})
export class ApiModule {
  static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        {
          provide: ApiConfiguration,
          useValue: params
        }
      ]
    }
  }

  constructor( 
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
      'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
