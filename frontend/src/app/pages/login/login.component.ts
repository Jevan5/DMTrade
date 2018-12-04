import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';
import { SetUserModalComponent } from '../../components/set-user-modal/set-user-modal.component';
import { ViewChild } from '@angular/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    @ViewChild('setUserModal') setUserModal: SetUserModalComponent;
    model = {
        email: "",
        password: "",
        newEmail: "",
        newPassword: ""
    }

    config = {};

    constructor(private loginService: LoginService, private router: Router) {
        if (this.loginService.loggedIn && this.loginService.security.getAccount()) {
            this.router.navigate(['']);
        }
    }

    /**
     * This function is called when the user clicks Login. It
     * asks the LoginService to log the user in.
     */
    loginClick(){
        if(!this.model.email || !this.model.password){
            return;
        }
        this.loginService.login(this.model.email, this.model.password, new RequestInfo(0, this, this.loginClickCallback));
    }

    /**
     * Callback for the login call.
     * 
     * @param requestResponse Information regarding the response.
     */
    private loginClickCallback(requestResponse: RequestResponse) : void {
        var self = requestResponse.requestInfo.self;
        // Problem logging in
        if(requestResponse.response.error){
            alert('Error: ' + requestResponse.response.error);
            self.model.password = '';
            return;
        } else if(requestResponse.response.security.getAccount()) { // Logged in as user who has setup personal information already
            self.router.navigate(['']);
        } else { // Logged in as user who has not setup their personal information already
            self.setUserModal.openModal();
        }
    }

    /**
     * This function is called when the user clicks Register. This
     * asks the LoginService to register the user by making an API call.
     */
    registerClick(){
        if(!this.model.newEmail || !this.model.newPassword){
            return;
        }
        this.loginService.register(this.model.newEmail, this.model.newPassword, new RequestInfo(0, this, this.registerCallback));
    }

    /**
     * This function is called whenever the LoginService has a response
     * to registering the user.
     * 
     * @param requestResponse Response from the
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
