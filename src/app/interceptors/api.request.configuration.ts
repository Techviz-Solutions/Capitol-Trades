import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
// import { Configuration } from '../configuration';
/**
 * Configuration for the performed HTTP requests
 */
@Injectable()
export class ApiRequestConfiguration {
  private nextAuthHeader: string;
  private nextAuthValue: string;

  private headerParams: Map<String, String> = new Map();

  /** Set to basic authentication */
  basic(user: string, password: string): void {
    this.nextAuthHeader = 'Authorization';
    this.nextAuthValue = 'Basic ' + btoa(user + ':' + password);
  }

  /** Set to session key */
  bearer(user: string, password: string): void {
    this.nextAuthHeader = 'Authorization';
    this.nextAuthValue = 'Bearer ' + btoa(user + ':' + password);
  }

  token(): void {
    const accessToken = localStorage.getItem('access_token');
    this.nextAuthHeader = 'Authorization';
    this.nextAuthValue = 'Bearer ' + accessToken;
  }

  /** Clear any authentication headers (to be called after logout) */
  clear(): void {
    this.nextAuthHeader = null;
    this.nextAuthValue = null;
    this.headerParams.clear();
  }

  public setHeaderParam(headerParam: string, contentTypes: string) {
    this.headerParams.set(headerParam, contentTypes);
  }

  /** Apply the current authorization headers to the given request */
  apply(req: HttpRequest<any>): HttpRequest<any> {
    const headers = {};
    if (this.nextAuthHeader) {
      headers[this.nextAuthHeader] = this.nextAuthValue;
    }
    if (this.headerParams.size > 0) {
      this.headerParams.forEach((val: any, key: any) => {
        headers[key] = val;
      });
    }
    this.headerParams.clear();
    return req.clone({
      setHeaders: headers
    });
  }
  public isJsonMime(mime: string): boolean {
    const jsonMime: RegExp = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
    return mime != null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
  }
}
