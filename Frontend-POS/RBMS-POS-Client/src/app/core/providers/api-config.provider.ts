import { Provider } from '@angular/core';
import { ApiConfiguration } from '../api/api-configuration';
import { environment } from '../../../environments/environment';

/**
 * ตั้งค่า API base URL ให้ ng-openapi-gen generated services
 *
 * ng-openapi-gen สร้าง ApiConfiguration class พร้อม rootUrl default เป็นค่าว่าง
 * Provider นี้ override ให้ใช้ค่าจาก environment.apiUrl แทน
 *
 * วางไว้ที่ core/providers/ (นอก core/api/) เพื่อไม่ให้ถูก gen-api overwrite
 */
export const apiConfigurationProvider: Provider = {
  provide: ApiConfiguration,
  useFactory: (): ApiConfiguration => {
    const config = new ApiConfiguration();
    config.rootUrl = environment.apiUrl;
    return config;
  },
};
