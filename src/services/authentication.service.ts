import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';
// import { authConfig } from '../app/auth.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export class GetUser {
  constructor(public userId: any, public email: any, public password: any) { }
}

@Injectable()
export class AuthenticationService {
  muser;
  constructor(private _router: Router, private httpClient: HttpClient) {
    this.configureWithNewConfigApi();
  }

  private configureWithNewConfigApi() {
    // this.oauthService.configure(authConfig);
    // this.oauthService.events.subscribe(e => {
    //   if (e.type === 'token_received') {
    //     const returnUrl = localStorage.getItem('returnUrl');
    //     localStorage.setItem('returnUrl', 'companies');
    //     this.getUser();
    //     this._router.navigateByUrl(returnUrl);
    //   }
    // });
    // this.oauthService.setStorage(localStorage);
    // this.oauthService.oidc = false;
    // this.oauthService.tryLogin({
    //   onTokenReceived: context => {
    //     console.log(context);
    //   }
    // });
  }

  public obtainAccessToken() {
   // this.oauthService.initImplicitFlow();
    this.getUser();
  }

  public isLoggedIn() {
    // if (this.oauthService.getAccessToken() === null) {
    //   return false;
    // }
    // return true;
  }

  public isAccessTokenPresent() {
    // if (this.oauthService.getAccessToken() !== null) {
    //   return true;
    // }
    // return false;
  }

  // public logout() {
  //   // let tokenUrl = authConfig.loginUrl;
  //   // tokenUrl = (tokenUrl as any).replace('/oauth/authorize', '/my/oauth/token');
  //   // const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
  //   // this.httpClient.delete(tokenUrl, {
  //   //  headers: headers
  //   })
  //     .subscribe(
  //       response => {
  //         console.log('Logout success!', response);
  //         // this.oauthService.logOut();
  //         this._router.navigate(['login']);
  //       },
  //       error => {
  //         console.log('Logout failed!');
  //         console.log('Error', error);
  //       }
  //     );
  // }

  public getUser() {
    // const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    // this.httpClient
    //   .get('http://oauth-server.x2iq.com/uaa/user', { headers }).subscribe(
    //     (response: any) => {
    //       console.log(response);
    //       this.muser = response;
    //     },
    //     error => {
    //       console.log(error);
    //     },
    //     () => {
    //       localStorage.setItem('username', this.muser.username);
    //     }
    //   );
  }
}

