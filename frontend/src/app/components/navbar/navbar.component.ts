import { Component, OnInit } from '@angular/core';
import { LoginService, RequestInfo } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  loginHeader;  // Displaying information about who's logged in
  isNavbarOpen: boolean = false;
  
  constructor(private loginService: LoginService, private portfolioService: PortfolioService,
    private router: Router) {
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

  toggleNavbar(){
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  dmTradeClick(){
    this.router.navigate(['']);
  }

  loginClick(){
    this.router.navigate(['/login']);
  }

  browseMarketClick(){
    this.router.navigate(['/browseMarket']);
  }

  logoutClick(){
    this.loginService.logout(new RequestInfo(0, this, function(response, self){

    }));
  }

  portfoliosClick(){
    this.router.navigate(['/portfolios']);
  }
}
