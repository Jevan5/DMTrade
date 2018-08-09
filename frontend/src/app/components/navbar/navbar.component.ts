import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { Config } from 'protractor';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  loginHeader;  // Displaying information about who's logged in

  constructor(private loginService: LoginService, private portfolioService: PortfolioService) {
    this.loginService.loginObservable.subscribe((data: Config) => {
      // loginObservable gave information implying a logout
      if(!data || !data.security.account){
        this.loginHeader = '';
      }
      // loginObservable gave information implying a login
      else{
        this.loginHeader = 'Logged in as ' + data.account.firstName;
      }
    });
  }

  // User pressed the logout button
  logoutClick(){
    // loginService handles navigating the user to the login page,
    // don't need to do anything
    this.loginService.logout(self, function(response){

    });
  }

}
