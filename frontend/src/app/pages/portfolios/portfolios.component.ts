import { Component, OnInit } from '@angular/core';
import { LoginService, RequestInfo, RequestResponse } from '../../services/login/login.service';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { PortfolioService, Portfolio } from '../../services/portfolio/portfolio.service';

@Component({
  selector: 'app-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.css']
})
export class PortfoliosComponent {
  portfolios: Array<Portfolio> = [];
  searchSeqNum: number = 0;
  loading: boolean = false;
  loadingMessage: string = '';

  constructor(private loginService: LoginService, private router: Router,
    private portfolioService: PortfolioService) {
    if(!this.loginService.loggedIn){
      this.router.navigate(['/login']);
      return;
    }
    this.getPortfolios();
  }

  /*
   * This function has the PortfolioService refresh it's list
   * of portfolios for the user.
   */
  getPortfolios(){
    this.loading = true;
    this.loadingMessage = 'Loading portfolios...';
    this.searchSeqNum++;
    this.portfolioService.requestPortfolios(new RequestInfo(this.searchSeqNum, this, this.getPortfoliosCallback));
  }

  /*
   * This function is called when the PortfolioService returns with
   * it's API response of the portfolios for the user.
   * 
   * @param {RequestResponse} requestResponse: Response from the PortfolioService
   * for getting the user's portfolios.
   */
  getPortfoliosCallback(requestResponse: RequestResponse) : void {
    let self = requestResponse.requestInfo.self;
    self.loading = false;
    self.loadingMessage = '';
    // Response is stale
    if(requestResponse.requestInfo.searchSeqNum !== self.searchSeqNum){
      return;
    }
    // Error getting the portfolios
    if(requestResponse.response.error){
      self.errorMessage = requestResponse.response.error;
    }
    // No 'portfolios' field in the response
    if(!requestResponse.response.hasOwnProperty('portfolios')
      || !requestResponse.response.portfolios.hasOwnProperty('length')){
      self.errorMessage = "requestResponse.response has no field 'portfolios' of type 'Array'.";
    }
    if(!requestResponse.response.portfolios.hasOwnProperty('length'))
    // Any existing errors
    if(self.errorMessage){
      return;
    }

    self.portfolios = requestResponse.response.portfolios;
  }

  /*
   * This function is called when the user clicks to
   * view a more detailed page about this portfolio.
   * 
   * @param {Portfolio} portfolio: Portfolio to view.
   */
  viewPortfolioClick(portfolio: Portfolio) : void {
    this.portfolioService.selectedPortfolio = portfolio;
    this.router.navigate(['/viewPortfolio']);
  }
  
  /*
   * This function is called when the user clicks to
   * delete a portfolio.
   * 
   * @param {Portfolio} portfolio: Portfolio to delete.
   */
  deletePortfolioClick(portfolio: Portfolio) : void {
    this.loading = true;
    this.loadingMessage = "Deleting '" + portfolio.name + "'...";
    this.portfolioService.deletePortfolio(portfolio, new RequestInfo(0, this, this.deletePortfolioClickCallback));
  }

  /*
   * This function is called when the PortfolioService
   * returns with a response for deleteing a portfolio.
   * 
   * @param {RequestResponse} requestResponse: Response from the PortfolioService
   * for deleting a portfolio.
   */
  deletePortfolioClickCallback(requestResponse: RequestResponse) : void {
    var self = requestResponse.requestInfo.self;
    self.loading = false;
    self.loadingMessage = '';
    // Problem deleting the portfolio
    if(requestResponse.response.error){
      self.errorMessage = requestResponse.response.error;
    }
    
    if(self.errorMessage){
      return;
    }
    // After portfolio has been deleted, reload the portfolios
    self.getPortfolios();
  }

}
