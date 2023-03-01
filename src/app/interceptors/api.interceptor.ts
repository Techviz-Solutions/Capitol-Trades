import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRequestConfiguration } from './api.request.configuration';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private apiConfig: ApiRequestConfiguration) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = this.apiConfig.apply(req);
    return next.handle(req);
  }
}
