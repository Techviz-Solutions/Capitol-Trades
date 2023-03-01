import { Configuration } from './configuration';

function configFactory(): Configuration {
    return new Configuration({
      accessToken : () => sessionStorage.getItem('access_token')
    });
  }

export {configFactory};
