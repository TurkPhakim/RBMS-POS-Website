import { Provider } from '@angular/core';
import { ApiConfiguration } from './api-configuration';
import { environment } from '../../../environments/environment';

export const apiConfigurationProvider: Provider = {
  provide: ApiConfiguration,
  useFactory: () => {
    const config = new ApiConfiguration();
    config.rootUrl = environment.apiUrl;
    return config;
  },
};
