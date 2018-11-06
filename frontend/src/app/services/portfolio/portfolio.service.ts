import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService, Model, RequestInfo, RequestResponse } from '../login/login.service';
import { MarketService } from '../../services/market/market.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  url: string = 'http://127.0.0.1:8080';
  portfolios: Array<Portfolio> = [];  // List of portfolios owned by this user
  selectedPortfolio: Portfolio;   // Last selected portfolio, for when a user navigates to the ViewPortfolio page

  constructor(private http: HttpClient, private router: Router,
    private loginService: LoginService, private marketService: MarketService) {

  }

  /* 
   * Deletes a portfolio for an account.
   * 
   * @param {Portfolio} portfolio: Portfolio to delete.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  deletePortfolio(portfolio: Portfolio, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.delete(this.url + '/portfolios/' + portfolio._id, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * Gets a list of portfolios that belong to the
   * account.
   * 
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  requestPortfolios(requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.get(this.url + '/portfolios', {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      this.portfolios = data.portfolios;
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * Gets a portfolio by id that is owned by
   * the logged in account.
   * 
   * @param {string} portfolio_id: id of the
   * portfolio to get.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  requestPortfolio(portfolio_id: string, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }

    this.http.get(this.url + '/portfolios/' + portfolio_id, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * Creates a portfolio for the logged in account.
   * 
   * @param {string} name: The name of the new
   * portfolio.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  postPortfolio(name: string, requestInfo: RequestInfo) : void {
    // Not logged in
    if(!this.loginService.loggedIn){
      requestInfo.respond({
        error: 'Not logged in.'
      });
      return;
    }
    this.http.post(this.url + '/portfolios', {
      name: name
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * Places a bid for a stock.
   * 
   * @param {string} symbol: The stock to place a bid for.
   * @param {number} quantity: The amount of shares to place
   * a bid for.
   * @param {number} price: The price at which to place a
   * bid for each share.
   * @param {Portfolio} portfolio: The portfolio to place
   * the bid under.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  postBid(symbol: string, quantity: number, price: number, portfolio: Portfolio, requestInfo: RequestInfo) : void {
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
    this.http.post(this.url + '/trades/' + portfolio._id, {
      price: price,
      quantity: quantity,
      symbol: symbol,
      action: 'bid'
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * Places an ask for a stock.
   * 
   * @param {string} symbol: The stock to place an ask for.
   * @param {number} quantity: The amount of shares to place
   * an ask for.
   * @param {number} price: The price at which to place an
   * ask for each share.
   * @param {Portfolio} portfolio: The portfolio to place the
   * bid under.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  postAsk(symbol: string, quantity: number, price: number, portfolio: Portfolio, requestInfo: RequestInfo) : void {
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
    this.http.post(this.url + '/trades/' + portfolio._id, {
      price: price,
      quantity: quantity,
      symbol: symbol,
      action: 'ask'
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * This function returns a list of mappings from symbol
   * to number of shares owned of that symbol for a
   * particular portfolio.
   * 
   * @param {Portfolio} portfolio: Portfolio to find
   * all the shares owned by.
   * 
   * @returns {Array<{symbol: string, shares: number}>}: List of mappings of
   * symbol -> number of shares owned.
   */
  getSharesOwned(portfolio: Portfolio) : Array<{symbol: string, shares: number}> {
    var map = {};

    for(let i = 0; i < portfolio.bids.length; i++){
      var bid = portfolio.bids[i];

      if(!map[bid.symbol]){
        map[bid.symbol] = bid.remaining;
      }
      else{
        map[bid.symbol] += bid.remaining;
      }
    }

    var asList = [];

    for(var key in map){
      if(map.hasOwnProperty(key)){
        if(map[key]){
          asList.push({
            symbol: key,
            shares: map[key]
          });
        }
      }
    }
    
    return asList;
  }

  /*
   * This function returns a list of mappings from Portfolio
   * to number of shares owned of the symbol.
   * 
   * @param {string} symbol: Symbol to find the shares owned by all portfolios.
   * @param {Array<Portfolio>} portfolios: Portfolios to find the number of
   * shares owned of the symbol.
   * 
   * @returns {Array<{portfolio: Portfolio, shares: number}>}: List of
   * mappings from Portfolio to shares owned of the symbol.
   */
  getSharesOwnedByPortfolios(symbol: string, portfolios: Array<Portfolio>) : Array<{portfolio: Portfolio, shares: number}> {
    symbol = symbol.toUpperCase();
    var portfolioAndShares: Array<{portfolio: Portfolio, shares: number}> = new Array<{portfolio: Portfolio, shares: number}>();

    for(let portfolio of portfolios){
      let shares = 0;
      for(let bid of portfolio.bids){
        if(bid.symbol === symbol){
          shares += bid.remaining;
        }
      }

      portfolioAndShares.push({
        portfolio: portfolio,
        shares: shares
      });
    }

    return portfolioAndShares;
  }

  /*
   * This function returns a list of transactions by
   * a portfolio, sorted in terms of the date they
   * were issued.
   * 
   * @param {Portfolio} portfolio: Portfolio to get
   * the list of transactions from.
   * 
   * @returns {Array<Transaction>}: List of transactions in order
   * from oldest -> newest
   */
  getTransactions(portfolio: Portfolio) : Array<Transaction> {
    var transactions = new Array<Transaction>();

    let bidIndex = 0;
    let askIndex = 0;

    // Insert the portfolios bids and asks into a new list, in order of
    // oldest -> newest (bids and asks are already sorted, amongst themselves)
    while(bidIndex < portfolio.bids.length && askIndex < portfolio.asks.length){
      // bid is next
      if(portfolio.bids[bidIndex].timeStamp < portfolio.asks[askIndex].timeStamp){
        transactions.push(new Transaction(null, portfolio.bids[bidIndex]));
        bidIndex++;
      }
      // ask is next
      else{
        transactions.push(new Transaction(portfolio.asks[askIndex], null));
        askIndex++;
      }
    }

    // If the bids are at the end, insert the rest of them
    while(bidIndex < portfolio.bids.length){
      transactions.push(new Transaction(null, portfolio.bids[bidIndex]));
      bidIndex++;
    }

    // If the asks are at the end, insert the rest of them
    while(askIndex < portfolio.asks.length){
      transactions.push(new Transaction(portfolio.asks[askIndex], null));
      askIndex++;
    }

    return transactions;
  }

  /*
   * Finds all symbols of shares currently owned
   * by the portfolio.
   * 
   * @param {Portfolio} portfolio: Portfolio to
   * find the symbols owned.
   * 
   * @returns {Array<string>}: List of symbols
   * owned by the Portfolio.
   */
  getSymbolsOwned(portfolio: Portfolio) : Array<string> {
    var symbolsSet = new Set<string>();

    // Find all symbols for a bid that has remaining shares
    for(let i = 0; i < portfolio.bids.length; i++){
      if(portfolio.bids[i].remaining > 0){
        symbolsSet.add(portfolio.bids[i].symbol);
      }
    }

    // Instantiate an Array, and fill it
    // with the symbols owned by the Portfolio
    var symbolsArray = new Array<string>();

    symbolsSet.forEach((symbol) => {
      symbolsArray.push(symbol);
    });

    return symbolsArray;
  }

  /*
   * 
   */  
}

export class Portfolio implements Model {
  public _id: string;
  public account: string;
  public bids: Array<Bid>;
  public name: string;
  public asks: Array<Ask>;

  constructor(_id: string, account: string, bids: Array<Bid>, name: string, asks: Array<Ask>){
    this._id = _id;
    this.account = account;
    this.bids = bids;
    this.name = name;
    this.asks = asks;
  }
}

export class Bid {
  public price: number;
  public quantity: number;
  public symbol: string;
  public timeStamp: Date;
  public remaining: number;
  public soldFor: number;

  constructor(price: number, quantity: number, symbol: string, timeStamp: Date, remaining: number, soldFor: number){
    this.price = price;
    this.quantity = quantity;
    this.symbol = symbol;
    this.timeStamp = timeStamp;
    this.remaining = remaining;
    this.soldFor = soldFor;
  }
}

export class Ask {
  public price: number;
  public quantity: number;
  public symbol: string;
  public timeStamp: Date;
  public boughtFor: number;

  constructor(price: number, quantity: number, symbol: string, timeStamp: Date, boughtFor: number){
    this.price = price;
    this.quantity = quantity;
    this.symbol = symbol;
    this.timeStamp = timeStamp;
    this.boughtFor = boughtFor;
  }
}

/*
 * A generic class, used to group Bids and Asks together.
 * If the object created is really an Ask, the ask field
 * will be set, while the bid field is left null. The
 * opposite is true for if the object is really a Bid.
 */
export class Transaction {
  public ask: Ask;
  public bid: Bid;

  constructor(ask: Ask, bid: Bid){
    this.ask = ask;
    this.bid = bid;
  }
}

/*
 * Represents the value of the Portfolio in two ways:
 * valuing shares at the value they were bid for, or that
 * they are currently valued at.
 */
export class PortfolioValue {
  portfolio: Portfolio;
	atBid: {           // Values of shares owned by portfolio, at their purchased price
		sumOfValues: number,
		values: Array<{       // List of symbols -> value of all shares owned at price purchased at
			symbol: string,
			value: number
		}>
	};

	atMoment: {             // Values of shares owned by portfolio, at their current price
		sumOfValues: number,
		values: Array<{       // List of symbols -> value of all shares owned at the current price
			symbol: string,
			value: number
		}>
	};

  /*
   * Initializes this PortfolioRevenue by seeing how much un-sold
   * bids were purchased for, and how much they are currently
   * worth in real-time.
   * 
   * @papram {Portfolio} portfolio: Portfolio to calculate the
   * PortfolioValue of.
   * @param {Map<string, number>} value: Mapping from symbol ->
   * the current value of a share of that symbol.
   */
	constructor(portfolio: Portfolio, values: Map<string, number>){
    this.portfolio = portfolio;
		this.atBid = {
			sumOfValues: 0,
			values: new Array<{symbol: string, value: number}>()
		};
		this.atMoment = {
			sumOfValues: 0,
			values: new Array<{symbol: string, value: number}>()
    };
    
    // Find the value of the shares owned by the portfolio, at the price they were purchased at
    let symbolValueMap: Map<string, number> = new Map<string, number>();
    let symbolRemainingMap: Map<string, number> = new Map<string, number>();  // Map of symbol -> amount of shares remaining
    for(let bid of this.portfolio.bids){
      if(!symbolValueMap.get(bid.symbol)){
        symbolValueMap.set(bid.symbol, bid.remaining * bid.price);
      }
      else{
        symbolValueMap.set(bid.symbol, symbolValueMap.get(bid.symbol) + bid.remaining * bid.price);
      }

      if(!symbolRemainingMap.get(bid.symbol)){
        symbolRemainingMap.set(bid.symbol, bid.remaining);
      }
      else{
        symbolRemainingMap.set(bid.symbol, symbolRemainingMap.get(bid.symbol) + bid.remaining);
      }
    }

    symbolValueMap.forEach((value, key, map) => {
      if(value !== 0){
        value = Math.round(value * 100) / 100;
        this.atBid.values.push({
          symbol: key,
          value: value
        });
        this.atBid.sumOfValues += value;
      }
    });

    this.atBid.sumOfValues = Math.round(this.atBid.sumOfValues * 100) / 100;

    // Find the value of the shares owned by the portfolio, at their current price
    values.forEach((value, key, map) => {
      value = Math.round(value * symbolRemainingMap.get(key) * 100) / 100;
      this.atMoment.values.push({
        symbol: key,
        value: value
      });
      this.atMoment.sumOfValues += value;
    });

    this.atMoment.sumOfValues = Math.round(this.atMoment.sumOfValues * 100) / 100;
  }
}

/*
 * Represents the revenues earned by the Portfolio in two ways:
 * only counting revenues as the difference of shares bid for
 * and later asked for, or counting revenues as the difference
 * of shares bid for and later asked for AND the difference
 * in currently owned shares and their real-time price.
 */
export class PortfolioRevenue {
  portfolio: Portfolio;
	atAsk: {
		sumOfRevenues: number,
		revenues: Array<{
			symbol: string,
			revenue: number
		}>
	};
  
	atMoment: {
		sumOfRevenues: number,
		revenues: Array<{
			symbol: string,
			revenue: number
		}>
	};

  /*
   * Initializes this PortfolioRevenue by seeing how much bids
   * were purchased and re-sold for, and how un-sold bids have
   * changed in price since their purchase.
   * 
   * @param {Portfolio} portfolio: Portfolio to calculate the
   * PortfolioRevenue of.
   * @param {Map<string, number>} values: Mapping from symbol ->
   * the current value of a share of that symbol.
   */
  constructor(portfolio: Portfolio, values: Map<string, number>){
    this.portfolio = portfolio;
    this.atAsk = {
      sumOfRevenues: 0,
      revenues: new Array<{symbol: string, revenue: number}>()
    };

    this.atMoment = {
      sumOfRevenues: 0,
      revenues: new Array<{symbol: string, revenue: number}>()
    };
    
    // Instantiate the revenue information with values they were sold at
    let atAskMap: Map<string, number> = new Map<string, number>();  // Map from symbol -> revenue earned by re-selling shares
    for(let bid of this.portfolio.bids){
      let revenue = bid.soldFor - (bid.quantity - bid.remaining) * bid.price;
      // Symbol has not been seen yet
      if(!atAskMap.get(bid.symbol)){
        atAskMap.set(bid.symbol, revenue);
      }
      // Symbol has a running revenue count
      else {
        atAskMap.set(bid.symbol, atAskMap.get(bid.symbol) + revenue);
      }
    }

    atAskMap.forEach((value, key, map) => {
      // Revenue found is non-zero, include it
      if(value !== 0){
        value = Math.round(value * 100) / 100;
        this.atAsk.revenues.push({
          symbol: key,
          revenue: value
        });

        this.atAsk.sumOfRevenues += value;
      }
    });
    this.atAsk.sumOfRevenues = Math.round(this.atAsk.sumOfRevenues * 100) / 100;

    // Instantiate the revenue information from earned revenues, and revenue
    // that would be incurred if you sold all outstanding shares right now
    let atMomentMap: Map<string, number> = new Map<string, number>(); // Map from symbol -> revenue earned by re-selling and outstanding shares
    for(let bid of this.portfolio.bids){
      let revenue = bid.soldFor - (bid.quantity - bid.remaining) * bid.price;
      revenue += bid.remaining * (values.get(bid.symbol) - bid.price);

      // Symbol has not been seen yet
      if(!atMomentMap.get(bid.symbol)){
        atMomentMap.set(bid.symbol, revenue);
      }
      else{
        atMomentMap.set(bid.symbol, revenue + atMomentMap.get(bid.symbol));
      }
    }

    atMomentMap.forEach((value, key, map) => {
      if(value !== 0){
        value = Math.round(value * 100) / 100;
        this.atMoment.revenues.push({
          symbol: key,
          revenue: value
        });

        this.atMoment.sumOfRevenues += value;
      }
    });
  
    this.atMoment.sumOfRevenues = Math.round(this.atMoment.sumOfRevenues * 100) / 100;
  }
}

interface PortfolioHistory {
  portfolio: Portfolio;
  range: string;

  constructor(portfolio: Portfolio, historicalValues: Map<string, [Date, number]>);
}

export class PortfolioValueHistory implements PortfolioHistory {
  portfolio: Portfolio;
  portfolioValues: Array<{date: Date, portfolioValue: PortfolioValue}>;

  constructor(portfolio: Portfolio, historicalValues: Map<string, [Date, number]>){
    this.portfolio = portfolio;
    this.portfolioValues = new Array<{date: Date, portfolioValue: PortfolioValue}>();
  }
}

export class PortfolioRevenueHistory implements PortfolioHistory {
  portfolio: Portfolio;
  portfolioRevenues: Array<{date: Date, portfolioRevenue: PortfolioRevenue}>;

  constructor(portfolio: Portfolio, historicalValues: Map<string, {date: Date, }>){
    this.portfolio = portfolio;
    this.portfolioRevenues = new Array<{date: Date, portfolioRevenue: PortfolioRevenue}>();
  }
}