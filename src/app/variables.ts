import { InjectionToken } from '@angular/core';

export const BASE_PATH = new InjectionToken<string>('basePath');
export const OAUTH_PROVIDER_URL = new InjectionToken<string>('oauthProviderUrl');
export const COLLECTION_FORMATS = {
  'csv': ',',
  'tsv': '   ',
  'ssv': ' ',
  'pipes': '|'
};
