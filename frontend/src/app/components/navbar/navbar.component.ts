import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { RequestInfo } from '../../../assets/requests/request-info';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { RequestResponse } from '../../../assets/requests/request-response';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  loginHeader;  // Displaying information about who's logged in
  isNavbarOpen: boolean = false;
  
  constructor(public loginService: LoginService, public portfolioService: PortfolioService,
    public router: Router) {
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
    this.loginService.logout(new RequestInfo(0, this, (r: RequestResponse) => {

    }));
  }

  portfoliosClick(){
    this.router.navigate(['/portfolios']);
  }
}
