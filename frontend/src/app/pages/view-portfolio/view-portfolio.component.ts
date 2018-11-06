import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { LoginService, RequestInfo, RequestResponse } from '../../services/login/login.service';
import { PortfolioService, Portfolio, Transaction, PortfolioValue, PortfolioRevenue } from '../../services/portfolio/portfolio.service';
import { Chart } from 'chart.js';
import { MarketService } from '../../services/market/market.service';

@Component({
  selector: 'app-view-portfolio',
  templateUrl: './view-portfolio.component.html',
  styleUrls: ['./view-portfolio.component.css']
})
export class ViewPortfolioComponent {

  portfolio: Portfolio;                                 // the portfolio being viewed
  portfolioRevenue: PortfolioRevenue;
  portfolioValue: PortfolioValue;
  messages: {
    loading: string,
    error: string
  };
  ownedShares: Array<{symbol: string, shares: number}>; // List of symbols -> amount shares owned of that stock by the Portfolio
  transactions: Array<Transaction>;
  charts: {
    valueDistribution: {
      atBid: ChartData,
      atMoment: ChartData
    },
    revenueDistribution: {
      atAsk: {
        profit: ChartData
        loss: ChartData
      },
      atMoment: {
        profit: ChartData,
        loss: ChartData
      }
    }
  };
  tables: {
    valueDistribution: ValueDistributionTable,
    revenueDistribution: RevenueDistributionTable
  };

  constructor(private loginService: LoginService, private portfolioService: PortfolioService,
    private router: Router, private elementRef: ElementRef, private marketService: MarketService) {
    // Not logged in
    if(!this.loginService.loggedIn){
      this.router.navigate(['/login']);
      return;
    }
    // No portfolio has been selected
    if(!this.portfolioService.selectedPortfolio){
      this.router.navigate(['/portfolios']);
      return;
    }

    this.portfolio = this.portfolioService.selectedPortfolio;
    this.messages = { loading: '', error: '' };
    this.charts = { valueDistribution: null, revenueDistribution: null };
    this.tables = { valueDistribution: null, revenueDistribution: null };

    this.reloadPortfolio();
  }

  /*
   * Reloads the portfolio information for the page.
   */
  reloadPortfolio() : void {
    this.messages.loading = 'Retrieving portfolio information...';
    this.portfolioService.requestPortfolio(this.portfolio._id, new RequestInfo(0, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      if(requestResponse.response.error){
        self.messages.error = requestResponse.response.error;
        self.messages.loading = '';
        return;
      }
  
      self.portfolio = requestResponse.response.portfolio;
      self.preparePortfolio();
    }));
  }

  /*
   * This function asks the PortfolioService to
   * prepare the PortfolioValue and PortfolioRevenue
   * of the selected Portfolio.
   */
  preparePortfolio() : void {
    this.messages.loading = 'Finding current prices of shares owned...';
    let symbols = this.portfolioService.getSymbolsOwned(this.portfolio);
    this.marketService.requestPrices(symbols, new RequestInfo(0, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      if(requestResponse.response.error){
        self.messages.error = requestResponse.response.error;
        self.messages.loading = '';
        return;
      }

      self.messages.loading = "Calculating portfolio's current value...";
      self.portfolioValue = new PortfolioValue(self.portfolio, requestResponse.response);
      self.messages.loading = "Calculating portfolio's current revenue...";
      self.portfolioRevenue = new PortfolioRevenue(self.portfolio, requestResponse.response);
      self.prepareData();
    }));
  }

  /*
   * Prepare all data for a portfolio, such as: How
   * much you've earned through trading, how many
   * shares of each stock do you own, etc.
   */
  prepareData() : void {
    this.messages.loading = 'Preparing data for display...';
    // Calculate total revenue of the portfolio
    this.ownedShares = this.portfolioService.getSharesOwned(this.portfolio);
    this.transactions = this.portfolioService.getTransactions(this.portfolio);
    this.transactions.reverse();  // reverse the order so that the latest transactions are shown first in the page
    this.prepareCharts();
    this.prepareTables();

    this.messages.loading = '';
  }

  /*
   * Prepares all the charts.
   */
  prepareCharts() : void {
    this.prepareValueDistributionCharts();
    this.prepareRevenueDistributionCharts();
  }

  /*
   * Prepares all the tables.
   */
  prepareTables() : void {
    this.prepareValueDistributionTable();
    this.prepareRevenueDistributionTable();
  }


  /*
   * Prepares doughnut charts that display the distribution of
   * your portfolio's current assets across the stocks.
   */
  prepareValueDistributionCharts() : void {
    this.charts.valueDistribution = {
      atBid: null,
      atMoment: null
    };

    // Create the chart showing the value distribution of shares owned, with the price
    // they were purchased at
    this.charts.valueDistribution.atBid = new ChartData();
    this.charts.valueDistribution.atBid.options = {
      title: {
        display: true,
        text: 'Value Distribution at Bid Price'
      }
    };
    this.charts.valueDistribution.atBid.chartType = 'doughnut';
    this.charts.valueDistribution.atBid.datasets.push({data: new Array<number>()});
    for(let i = 0; i < this.portfolioValue.atBid.values.length; i++){
      let symbolToValue = this.portfolioValue.atBid.values[i];
      this.charts.valueDistribution.atBid.labels.push(symbolToValue.symbol);
      this.charts.valueDistribution.atBid.datasets[0].data.push(symbolToValue.value);
    }

    // Create the chart showing the value distribution of shares owned, with their
    // current price
    this.charts.valueDistribution.atMoment = new ChartData();
    this.charts.valueDistribution.atMoment.options = {
      title: {
        display: true,
        text: 'Value Distribution at Current Prices'
      }
    };
    this.charts.valueDistribution.atMoment.chartType = 'doughnut';
    this.charts.valueDistribution.atMoment.datasets.push({data: new Array<number>()});
    for(let i = 0; i < this.portfolioValue.atMoment.values.length; i++){
      let symbolToValue = this.portfolioValue.atMoment.values[i];
      this.charts.valueDistribution.atMoment.labels.push(symbolToValue.symbol);
      this.charts.valueDistribution.atMoment.datasets[0].data.push(symbolToValue.value);
    }
  }

  /*
   * Prepares doughnut charts that displays the distribution of
   * revenue earned by your portfolio.
   */
  prepareRevenueDistributionCharts(): void {
    this.charts.revenueDistribution = {
      atAsk: {
        profit: null,
        loss: null
      },
      atMoment: {
        profit: null,
        loss: null
      }
    };

    // Create charts displaying the portfolio's revenue (profits and losses)
    // for shares that have been purchased and re-sold

    // Profit chart from re-selling
    this.charts.revenueDistribution.atAsk.profit = new ChartData();
    this.charts.revenueDistribution.atAsk.profit.options = {
      title: {
        display: true,
        text: 'Profit Distribution from Re-sold Shares'
      }
    };
    this.charts.revenueDistribution.atAsk.profit.chartType = 'doughnut';
    this.charts.revenueDistribution.atAsk.profit.datasets.push({data: new Array<number>()});

    // Loss chart from re-selling
    this.charts.revenueDistribution.atAsk.loss = new ChartData();
    this.charts.revenueDistribution.atAsk.loss.options = {
      title: {
        display: true,
        text: 'Loss Distribution from Re-sold Shares'
      }
    };
    this.charts.revenueDistribution.atAsk.loss.chartType = 'doughnut';
    this.charts.revenueDistribution.atAsk.loss.datasets.push({data: new Array<number>()});

    // Iterate over the revenues from shares that have been re-sold
    for(let revenue of this.portfolioRevenue.atAsk.revenues){
      // It is a profit
      if(revenue.revenue > 0){
        this.charts.revenueDistribution.atAsk.profit.labels.push(revenue.symbol);
        this.charts.revenueDistribution.atAsk.profit.datasets[0].data.push(revenue.revenue);
      }
      // It is a loss
      else if(revenue.revenue < 0){
        this.charts.revenueDistribution.atAsk.loss.labels.push(revenue.symbol);
        this.charts.revenueDistribution.atAsk.loss.datasets[0].data.push(revenue.revenue);
      }
    }

    // Create charts displaying the portfolio's revenue (profits and losses)
    // for shares that have been purchased and re-sold, and the revenue
    // that would be gathered if all oustanding purchases were sold right now

    // Profit chart from re-selling and accrued profits
    this.charts.revenueDistribution.atMoment.profit = new ChartData();
    this.charts.revenueDistribution.atMoment.profit.options = {
      title: {
        display: true,
        text: 'Profit Distribution from Re-sold and Changes in Current Prices'
      }
    };
    this.charts.revenueDistribution.atMoment.profit.chartType = 'doughnut';
    this.charts.revenueDistribution.atMoment.profit.datasets.push({data: new Array<number>()});

    // Loss chart from re-selling and accrued losses
    this.charts.revenueDistribution.atMoment.loss = new ChartData();
    this.charts.revenueDistribution.atMoment.loss.options = {
      title: {
        display: true,
        text: 'Loss Distribution from Re-sold and Changes in Current Prices'
      }
    };
    this.charts.revenueDistribution.atMoment.loss.chartType = 'doughnut';
    this.charts.revenueDistribution.atMoment.loss.datasets.push({data: new Array<number>()});

    // Iterate over the revenues of re-sold shares and revenues that would
    // occur from selling all outstanding shares right now
    for(let revenue of this.portfolioRevenue.atMoment.revenues){
      // Profit
      if(revenue.revenue > 0){
        this.charts.revenueDistribution.atMoment.profit.labels.push(revenue.symbol);
        this.charts.revenueDistribution.atMoment.profit.datasets[0].data.push(revenue.revenue);
      }
      // Loss
      else if(revenue.revenue < 0){
        this.charts.revenueDistribution.atMoment.loss.labels.push(revenue.symbol);
        this.charts.revenueDistribution.atMoment.loss.datasets[0].data.push(revenue.revenue);
      }
    }
  }

  /*
   * Prepares a table to show the shares owned, the total value at their bid prices,
   * and their total value at their current price.
   */
  prepareValueDistributionTable() : void {
    this.tables.valueDistribution = new ValueDistributionTable(this.ownedShares, this.portfolioValue);
  }

  /*
  * Prepares a table to show the revenues earned by purchasing and re-selling shares,
  * and the revenue incurred from the price change in outstanding shares.
  */
 prepareRevenueDistributionTable(): void {
   this.tables.revenueDistribution = new RevenueDistributionTable(this.portfolioRevenue);
 }
}

class ChartData {
  datasets: Array<{data: Array<number>}>;
  labels: Array<string>;
  options: any;
  chartType: string;

  constructor(){
    this.datasets = new Array<{data: Array<number>}>();
    this.labels = new Array<string>();
  }
}

interface Table {
  columns: Array<string>;
  rows: Array<Array<any>>;
}

class ValueDistributionTable implements Table {
  columns: Array<string>;
  rows: Array<Array<any>>;

  constructor(ownedShares: Array<{symbol: string, shares: number}>, portfolioValue: PortfolioValue){
    this.columns = new Array<string>();
    this.columns.push('Symbol');
    this.columns.push('Shares Owned');
    this.columns.push('Value at Bid Price ($)');
    this.columns.push('Value at Moment ($)');

    this.rows = new Array<Array<any>>();

    // The last row in the table will be the total of all rows
    let total = {
      shares: 0,
      valueAtMoment: portfolioValue.atMoment.sumOfValues,
      valueAtBid: portfolioValue.atBid.sumOfValues
    };

    let sharesMap: Map<string, {shares: number, valueAtBid: number, valueAtMoment: number}> = new Map<string, {shares: number, valueAtBid: number, valueAtMoment: number}>();

    // Set the number of owned shares for each symbol
    for(let ownedShare of ownedShares){
      sharesMap.set(ownedShare.symbol, {
        shares: ownedShare.shares,
        valueAtMoment: null,
        valueAtBid: null
      });
      total.shares += ownedShare.shares;
    }

    // Set the value at bid for each symbol
    for(let valueAtBid of portfolioValue.atBid.values){
      sharesMap.set(valueAtBid.symbol, {
        shares: sharesMap.get(valueAtBid.symbol).shares,
        valueAtBid: valueAtBid.value,
        valueAtMoment: null
      });
    }

    // Set the value at moment for each symbol
    for(let valueAtMoment of portfolioValue.atMoment.values){
      sharesMap.set(valueAtMoment.symbol, {
        shares: sharesMap.get(valueAtMoment.symbol).shares,
        valueAtBid: sharesMap.get(valueAtMoment.symbol).valueAtBid,
        valueAtMoment: valueAtMoment.value
      });
    }

    // Fill the rows
    sharesMap.forEach((value, key, map) => {
      let row = new Array<any>();
      row.push(key);
      row.push(value.shares);
      row.push(value.valueAtBid);
      row.push(value.valueAtMoment);
      this.rows.push(row);
    });

    let totalRow = new Array<any>();
    totalRow.push('Total');
    totalRow.push(total.shares);
    totalRow.push(total.valueAtBid);
    totalRow.push(total.valueAtMoment);
    this.rows.push(totalRow);
  }
}

class RevenueDistributionTable implements Table {
  columns: Array<string>;
  rows: Array<Array<any>>;

  constructor(portfolioRevenue: PortfolioRevenue){
    this.columns = new Array<string>();
    this.columns.push('Symbol');
    this.columns.push('Revenue Earned ($)');
    this.columns.push('Revenue at Moment ($)');

    // The last row in the table will be a total
    let total = {
      atAsk: portfolioRevenue.atAsk.sumOfRevenues,
      atMoment: portfolioRevenue.atMoment.sumOfRevenues
    };

    // For each symbol, find the revenue at ask, and at moment
    let revenuesMap: Map<string, { atAsk: number, atMoment: number }> = new Map<string, { atAsk: number, atMoment: number }>();

    // Find the revenue earned by purchasing and re-selling shares
    for(let revenue of portfolioRevenue.atAsk.revenues){
      revenuesMap.set(revenue.symbol, {
        atAsk: revenue.revenue,
        atMoment: null
      });
    }

    // Find the revenue earned by purchasing and re-selling shares, and revenues
    // incurred from price changes in outstanding shares
    for(let revenue of portfolioRevenue.atMoment.revenues){
      revenuesMap.set(revenue.symbol, {
        atAsk: revenuesMap.get(revenue.symbol) !== undefined ? revenuesMap.get(revenue.symbol).atAsk : 0,
        atMoment: revenue.revenue
      });
    }

    // Fill the rows
    this.rows = new Array<any>();
    revenuesMap.forEach((value, key, map) => {
      let row = new Array<any>();
      row.push(key);
      row.push(value.atAsk);
      row.push(value.atMoment)

      this.rows.push(row);
    });

    let lastRow = new Array<any>();
    lastRow.push('Total');
    lastRow.push(total.atAsk);
	lastRow.push(total.atMoment);
	this.rows.push(lastRow);
  }
}