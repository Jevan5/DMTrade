import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { MarketService } from '../../services/market/market.service';
import { environment } from '../../../environments/environment';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';
import { Portfolio } from '../../models/portfolio';
import { Trade } from 'src/app/models/trade';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  url: string = environment.dmTradeBackendURL;
  portfolios: Array<Portfolio>;   // List of portfolios owned by this user
  selectedPortfolio: Portfolio;   // Last selected portfolio, for when a user navigates to the ViewPortfolio page

  constructor(private http: HttpClient, private router: Router,
    private loginService: LoginService, private marketService: MarketService) {

  }

  /**
   * Deletes a portfolio by ID.
   * @param portfolioId ID of the portfolio to delete.
   * @param requestInfo Information regarding the request and how
   * to respond.
   */
  deletePortfolio(portfolioId: string, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.delete(this.url + 'portfolios/' + portfolioId, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      if (!data.hasOwnProperty('portfolio')) {
        throw 'data = ' + data;
      }
      
      requestInfo.respond(new Portfolio(data.portfolio));
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * Fetches all the portfolios the user owns.
   * @param requestInfo Information regarding the request and
   * how to respond.
   */
  requestPortfolios(requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.get(this.url + 'portfolios', {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      if (!data.hasOwnProperty('portfolios') || data.portfolios.constructor !== Array) {
        throw 'data = ' + data;
      }

      this.portfolios = new Array<Portfolio>();
      data.portfolios.forEach((portfolio) => {
        this.portfolios.push(new Portfolio(portfolio));
      });
      requestInfo.respond(this.portfolios);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * Fetches the requested portfolio by ID.
   * @param portfolio_id ID of the portfolio to request.
   * @param requestInfo Information regarding the request and
   * how to respond.
   */
  requestPortfolio(portfolioId: string, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.get(this.url + 'portfolios/' + portfolioId, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(new Portfolio(data.portfolio));
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * Creates a portfolio for the user.
   * @param name Name of the portfolio.
   * @param requestInfo Information regarding the request and
   * how to respond.
   */
  postPortfolio(name: string, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }
    this.http.post(this.url + 'portfolios', {
      name: name
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(new Portfolio(data.portfolio));
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * Posts a bid in the portfolio.
   * 
   * @param symbol Symbol to place the bid for.
   * @param quantity How many shares to bid for.
   * @param price Price of each share.
   * @param portfolioId The ID of the portfolio to place the bid in.
   * @param requestInfo Information regarding the request and
   * how to respond.
   */
  postBid(symbol: string, quantity: number, price: number, portfolioId: string, requestInfo: RequestInfo) : void {
    if(!symbol){
      requestInfo.respond({
        error: 'symbol must be a non-empty string.'
      });
      return;
    }
    if(quantity <= 0){
      requestInfo.respond({
        error: 'quantity must be a positive non-zero number.'
      });
      return;
    }
    if(price <= 0){
      requestInfo.respond({
        error: 'price must be a positive non-zero number.'
      });
      return;
    }
    this.http.post(this.url + 'bids', {
      price: price,
      quantity: quantity,
      symbol: symbol,
      portfolio: portfolioId
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(new Trade(data.bid));
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * Posts an ask in the portfolio.
   * @param symbol Symbol to place the ask for.
   * @param quantity How many shares to ask for.
   * @param price Price of each share.
   * @param portfolioId The portfolio to place the ask in.
   * @param requestInfo Information regarding the request and
   * how to respond.
   */
  postAsk(symbol: string, quantity: number, price: number, portfolioId: string, requestInfo: RequestInfo) : void {
    if(!symbol){
      requestInfo.respond({
        error: 'symbol must be a non-empty string.'
      });
      return;
    }
    if(quantity <= 0){
      requestInfo.respond({
        error: 'quantity must be a positive non-zero number.'
      });
      return;
    }
    if(price <= 0){
      requestInfo.respond({
        error: 'price must be a positive non-zero number.'
      });
      return;
    }
    this.http.post(this.url + 'asks', {
      price: price,
      quantity: quantity,
      symbol: symbol,
      portfolio: portfolioId
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security.get_id(),
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(new Trade(data.ask));
    }, error => {
      requestInfo.respond(error);
    });
  }
}