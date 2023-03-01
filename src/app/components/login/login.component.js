"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var data_service_1 = require("../../services/data.service");
var AuthenticateApi_1 = require("../../api/AuthenticateApi");
var LoginComponent = (function () {
    function LoginComponent(_router, _dataService, _authenticateApi) {
        this._router = _router;
        this._dataService = _dataService;
        this._authenticateApi = _authenticateApi;
        this.errorMsg = '';
    }
    LoginComponent.prototype.ngOnInit = function () {
        if (localStorage.getItem("username") !== null) {
            this._router.navigate(['companies']);
        }
        this.getUserIp();
    };
    LoginComponent.prototype.getUserIp = function () {
        var _this = this;
        this._dataService.getip().subscribe(function (response) {
            _this.ipAddress = response.ip;
        }, function (error) { return console.log(error); }, function () {
        });
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        this._authenticateApi.login(this.loginName, this.loginPassword, this.ipAddress).subscribe(function (response) {
            _this.user = response;
            console.log(_this.user);
        }, function (error) {
            console.log(error);
            if (error.status == 401) {
                var obj = JSON.parse(error._body);
                _this.errorMsg = obj.message;
            }
            else {
                _this.errorMsg = error.statusText;
            }
        }, function () {
            if (Object.keys(_this.user).length === 0) {
                console.log('Empty Object');
            }
            else {
                localStorage.setItem("username", JSON.stringify(_this.user.firstName));
                localStorage.setItem("userId", _this.user.userID);
                _this._router.navigate(['companies']);
            }
        });
    };
    LoginComponent.prototype.logout = function () {
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        this._router.navigate(['login']);
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login-form',
        template: "\n        <div class=\"login-box\">\n            <div class=\"login-box-body\">\n                <h2 style=\"text-align:center;\">2IQ Research</h2>\n                <p class=\"login-box-msg\">Sign in to start your session</p>\n                <p *ngIf=\"errorMsg !== ''\" style=\"color:#a94442;\">{{errorMsg}}</p>\n                <form #loginForm=\"ngForm\" class=\"login-form\" novalidate>\n                    <div class=\"form-group has-feedback\">\n                        <input type=\"text\" [(ngModel)]=\"loginName\" required class=\"form-control\" name=\"username\" placeholder=\"Username\" #name=\"ngModel\">\n                        <span class=\"glyphicon glyphicon-envelope form-control-feedback\"></span>\n                    </div>\n                    <div [hidden]=\"name.valid || name.pristine\" class=\"alert alert-danger\">\n                        Username is required\n                    </div>\n                    <div class=\"form-group has-feedback\">\n                        <input type=\"password\" [(ngModel)]=\"loginPassword\" required class=\"form-control\" name=\"password\" placeholder=\"Password\" #psw=\"ngModel\">\n                        <span class=\"glyphicon glyphicon-lock form-control-feedback\"></span>\n                    </div>\n                    <div [hidden]=\"psw.valid || psw.pristine\" class=\"alert alert-danger\">\n                        Password is required\n                    </div>\n                    \n                    <div class=\"form-group\">\n                        <button [disabled]=\"!loginForm.form.valid\" class=\"pull-right btn btn-primary form-control\" type=\"submit\" (click)=\"login()\">Login</button>\n                    </div>\n                </form>\n            </div>\n        </div>   \n    \t",
        providers: [AuthenticateApi_1.AuthenticateApi],
        styles: ["\n            .login-box {\n                width: 300px;\n                margin: 0 auto;\n            }\n            .login-box-msg {\n                text-align:center;\n            }\n            input[type='text'] {\n                width: 100%;\n            }\n            .login-form .form-control[disabled] {\n                background-color: #337ab7 !important;\n            }\n        "]
    }),
    __metadata("design:paramtypes", [router_1.Router, data_service_1.DataService, AuthenticateApi_1.AuthenticateApi])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map