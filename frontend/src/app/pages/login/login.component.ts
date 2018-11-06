import { Component, OnInit } from '@angular/core';
import { LoginService, RequestInfo, RequestResponse } from '../../services/login/login.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    model = {
        email: "",
        password: "",
        newEmail: "",
        newPassword: ""
    }

    config = {};

    constructor(private loginService: LoginService, private router: Router) {
        this.loginService.loginObservable.subscribe((data: Config) => {
            // Logged in
            if(data){
                this.router.navigate(['']);
            }
        });
        if(this.loginService.loggedIn){
            this.router.navigate(['']);
        }
    }

    ngOnInit() {
        
    }

    /*
     * This function is called when the user clicks Login. It
     * asks the LoginService to log the user in.
     */
    loginClick(){
        if(!this.model.email || !this.model.password){
            return;
        }
        this.loginService.login(this.model.email, this.model.password, new RequestInfo(0, this, this.loginCallBack));
    }

    /*
     * This function is called when the LoginService has a response
     * from the API, or generated an error.
     * 
     * @param {RequestResponse} requestResponse: Response from the
     * LoginService for logging the user in.
     */
    loginCallBack(requestResponse: RequestResponse) : void {
        var self = requestResponse.requestInfo.self;
        // Problem logging in
        if(requestResponse.response.error){
            alert('Error: ' + requestResponse.response.error);
            self.model.password = '';
            return;
        }
        // Logged into user who has setup personal information already
        else if(requestResponse.response.security.account){
            self.router.navigate(['']);
        }
    }

    /*
     * This function is called when the user clicks Register. This
     * asks the LoginService to register the user by making an API call.
     */
    registerClick(){
        if(!this.model.newEmail || !this.model.newPassword){
            return;
        }
        this.loginService.register(this.model.newEmail, this.model.newPassword, new RequestInfo(0, this, this.registerCallback));
    }

    /*
     * This function is called whenever the LoginService has a response
     * to registering the user.
     * 
     * @param {RequestResponse} requestResponse: Response from the
     * LoginService for registering the user.
     */
    registerCallback(requestResponse: RequestResponse) : void {
        var self = requestResponse.requestInfo.self;
        if(requestResponse.response.error){
            alert('Error: ' + requestResponse.response.error);
            self.model.newEmail = '';
            self.model.newPassword = '';
            return;
        }
        alert('Account created! An email has been sent to your inbox for verification instructions.');
        self.model.email = self.model.newEmail;
    }
}
