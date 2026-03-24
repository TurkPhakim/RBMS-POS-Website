import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ApiConfiguration } from '@core/api/api-configuration';
import { environment } from '@env/environment';

function initApiConfig(config: ApiConfiguration): () => void {
  return () => {
    config.rootUrl = environment.apiUrl;
  };
}

export function provideApiConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: initApiConfig,
      deps: [ApiConfiguration],
      multi: true,
    },
  ]);
}
