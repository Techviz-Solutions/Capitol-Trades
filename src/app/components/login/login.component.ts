import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-form',
  templateUrl: 'login.component.html',
})

export class LoginComponent implements OnInit {
  // loginName: string;
  // loginPassword: string;
  // errorMsg: string = '';
  // user: any;
  // ipAddress: string;

  // constructor(private _router: Router, private _dataService: DataService,
  //         // private _authenticateService: AuthenticateService,
  //           private authService: AuthenticationService) { }
  ngOnInit() {
    // if (this.authService.isLoggedIn()) {
    //  // this._router.navigate(['companies']);
    // }
    // this.getUserIp();
  }

  getUserIp() {
    // this._dataService.getip().subscribe(
    //   (response) => {
    //     this.ipAddress = response.ip;
    //   },
    //   error => console.log(error),
    //   () => {
    //   }
    // );
  }

  login() {
    // this.loginParams = { ip: this.ipAddress, password: this.loginPassword, username: this.loginName };
    // //this.apiConfig.basic(this.loginName, this.loginPassword);
    // this._authenticateService.login(this.loginParams).subscribe(
    //   (response) => {
    //     this.user = response;
    //   },
    //   (error) => {
    //     if (error.status == 401) {
    //       this.errorMsg = error.error;
    //     } else {
    //       this.errorMsg = error.statusText;
    //     }
    //   },
    //   () => {
    //     if (Object.keys(this.user).length === 0) {
    //     } else {
    //       localStorage.setItem("username", JSON.stringify(this.user.firstName));
    //       localStorage.setItem("userId", this.user.ID);
    //       localStorage.setItem("isAdmin", this.user.isAdmin);
    //       localStorage.setItem("userName", this.user.userName);
    //       localStorage.setItem("password", this.user.password);
    //       this._router.navigate(['companies']);
    //     }
    //   }
    // );
  }

  logout() {
    // localStorage.removeItem("username");
    // localStorage.removeItem("userId");
    // localStorage.removeItem("isAdmin");
    // localStorage.removeItem("userName");
    // localStorage.removeItem("password");
    // this._router.navigate(['login']);
  }

}


