import { Provider } from '@angular/core';
import { ApiConfiguration } from './api-configuration';
import { environment } from '../../../environments/environment';

/**
 * Provider สำหรับ configure API Configuration
 * ใช้ rootUrl จาก environment.apiUrl
 *
 * NOTE: ไฟล์นี้เป็น Template — copy-api-config script จะ copy ไปที่ src/app/core/api/ หลัง gen-api
 */
export const apiConfigurationProvider: Provider = {
  provide: ApiConfiguration,
  useFactory: (): ApiConfiguration => {
    const config = new ApiConfiguration();
    config.rootUrl = environment.apiUrl;
    return config;
  },
};
