import { Provider } from '@angular/core';
import { ApiConfiguration } from '@core/api/api-configuration';
import { environment } from '@env/environment';

export const apiConfigurationProvider: Provider = {
  provide: ApiConfiguration,
  useFactory: (): ApiConfiguration => {
    const config = new ApiConfiguration();
    config.rootUrl = environment.apiUrl;
    return config;
  },
};
