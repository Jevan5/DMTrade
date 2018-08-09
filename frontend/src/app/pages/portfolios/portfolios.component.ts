import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio/portfolio.service';

@Component({
  selector: 'app-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.css']
})
export class PortfoliosComponent {

  portfolios = [];

  constructor(private loginService: LoginService, private router: Router,
    private portfolioService: PortfolioService) {
    if(!this.loginService.loggedIn){
      this.router.navigate(['/login']);
      return;
    }
    this.getPortfolios();
  }

  getPortfolios(){
    this.portfolioService.getPortfolios(this, this.getPortfoliosCallback);
  }

  getPortfoliosCallback(self, response){
    // Error getting the portfolios
    if(response.error){
      alert('Could not find portfolios: ' + response.error);
    }
    // Found the portfolios of the user
    else{
      self.portfolios = response.portfolios;
    }
  }

}
