import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
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

    constructor(private loginService: LoginService,
                private router: Router) {
                    if(this.loginService.loggedIn){
                        this.router.navigate(['']);
                    }
    }

    ngOnInit() {
        
    }

    loginClick(){
        if(!this.model.email || !this.model.password){
            return;
        }
        this.loginService.login(this.model.email, this.model.password, this, this.loginCallBack);
    }

    loginCallBack(self, response){
        // Problem logging in
        if(response.error){
            alert('Error: ' + response.error);
            self.model.password = '';
            return;
        }
        // Logged into user who has setup personal information already
        else if(response.security.account){
            self.router.navigate(['']);
        }
    }

    registerClick(){
        if(!this.model.newEmail || !this.model.newPassword){
            return;
        }
        this.loginService.register(this.model.newEmail, this.model.newPassword, this, this.registerCallback);
    }

    registerCallback(self, response){
        if(response.error){
            alert('Error: ' + response.error);
            self.model.newEmail = '';
            self.model.newPassword = '';
            return;
        }
        alert(response);
        self.model.email = self.model.newEmail;
    }
}
