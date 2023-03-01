import {Component, OnInit, DoCheck, Input, ViewChild} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatDrawerMode} from '@angular/material/sidenav';
import {FiltersComponent} from './shared/components/filters/filters.component';
import { filter } from 'rxjs/operators';
declare var gtag;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, DoCheck {

  mode: MatDrawerMode;
  opened: boolean;
  user: string;
  isAdmin;
  sessionEndDate;
  isLoggedIn = false;
  isTokenPresent = false;
  countdown = 1000;
  userName: string;
  constructor(private router: Router, private authenticationService: AuthenticationService,
              public breakpointObserver: BreakpointObserver) { 
                const navEndEvents = router.events.pipe(
                  filter(event => event instanceof NavigationEnd),
                );
                navEndEvents.subscribe((event: NavigationEnd)=>{
                  gtag('config', 'UA-313522-9', {
                    'page_path': event.urlAfterRedirects
                  });
                  gtag('set', 'page', event.urlAfterRedirects);
                  gtag('send', 'pageview');
                });
              }
  title = 'senator-frontend';
  ngOnInit() {
    this.checkLoggedIn();
    // this.isTokenPresent = this.authenticationService.isAccessTokenPresent();
    // if (this.isTokenPresent) {
    //   this.sessionEndDate = new Date(Number(localStorage.getItem('expires_at')));
    // }
    this.userName =  localStorage.getItem('username');
    this.mode = 'side';
    this.opened = true;
    if (this.breakpointObserver.isMatched('(max-width: 1024px)')) {
      this.mode = 'over';
      this.opened = false;
    }
  }
  login() {
    this.authenticationService.obtainAccessToken();
  }
  checkLoggedIn() {
   // this.isLoggedIn = this.authenticationService.isLoggedIn();
  }
  ngDoCheck() {
    this.user = localStorage.getItem('username');
    this.isAdmin = localStorage.getItem('isAdmin');
  }
  logout() {
    this.user = null;
    // this.authenticationService.logout();
    this.isLoggedIn = false;
    this.isTokenPresent = false;
  }

}


