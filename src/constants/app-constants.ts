import { InjectionToken } from '@angular/core';
import { IAppConfig } from './app-constants.interface';

export const APP_DI_CONFIG: IAppConfig = {
  unauthorizedError: 'Unauthorized Request.',
  unExpectedError: 'Unexpected Error.',
  conflictError: 'Combination already requested.'
};

export let APP_CONFIG = new InjectionToken< IAppConfig >( 'app.config' );
