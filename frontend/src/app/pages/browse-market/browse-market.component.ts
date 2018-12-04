import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { MarketService, CompanyHistory } from '../../services/market/market.service';
import { Config } from 'protractor';
import { Chart } from 'chart.js';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';

@Component({
  selector: 'app-browse-market',
  templateUrl: './browse-market.component.html',
  styleUrls: ['./browse-market.component.css']
})
export class BrowseMarketComponent {
  //@ViewChild('canvas') canvas: ElementRef;
  model: {
    symbolToSearch: string,
    range: string
  };
  symbol: string;
  chartData;
  options;
  chart;
  errorMessage: string = '';
  loading: boolean = false;
  loadingMessage: string = '';
  beginAtZero: boolean = false;
  applicationError = 'Application error. Please try re-loading the page.';

  constructor(private marketService: MarketService, private portfolioService: PortfolioService,
    private elementRef: ElementRef, private loginService: LoginService) {
    this.model = {
      symbolToSearch: '',
      range: this.marketService.ranges[2]
    };
  }

  /**
   * This function is called when the user presses Search. This
   * starts the loading of the data for the graph.
   */
  searchClick() : void {
    if(!this.model.symbolToSearch){
      return;
    }
    this.symbol = this.model.symbolToSearch.toUpperCase();
    this.loadData();
  }

  /**
   * Generates a graph for the searched stock symbol. Gathers
   * data by querying the MarketService, and creates the graph
   * based on the user's inputs.
   */
  loadData() : void {
    this.loading = true;
    this.loadingMessage = 'Loading market data...';
    this.chartData = null;
    this.chart = null;
    this.errorMessage = '';
    this.marketService.getMarket(this.symbol, this.model.range, new RequestInfo(0, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      if(requestResponse.response.error){
        self.errorMessage = requestResponse.response.error;
        self.loading = false;
        self.loadingMessage = '';
        return;
      }
      if(requestResponse.response["Error Message"]){
        self.errorMessage = 'Please enter a valid symbol.';
        self.loading = false;
        self.loadingMessage = '';
        return;
      }
      if(self.errorMessage){
        return;
      }
      var companyHistory: CompanyHistory = requestResponse.response;
      self.prepareData(companyHistory);
      self.displayGraph(self.chartData);
    }));
  }

  displayGraph(chartData){
    this.chart = null;
    // If the chart is overwritten and only the beginAtZero is changed,
    // ng2-chart does not recognize that it's changed, and does nothing.
    // Need to set a timeout so that it clears the graph, then resets
    // it with the proper beginAtZero value.
    setTimeout(() => {
      this.chart = chartData;
      this.loading = false;
      this.loadingMessage = '';
    }, 1);
  }

  /**
   * Generates chart data that can be used to create a chart.
   *
   * @param companyHistory Historical data
   * about the company to create the graph from.
   */
  prepareData(companyHistory: CompanyHistory) : void {
    this.chartData = {
      chartType: 'line',
      datasets: [],
      labels: [],
      options: {
        responsive: true,
        title: {
          display: true,
          text: this.symbol
        },
        legend: {
          display: true
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: this.beginAtZero
            }
          }]
        }
      }
    };
    // Setup the 4 datasets on the graph. Each dataset will
    // be a line on the graph. One for the opening, closing,
    // high, and low values of the day
    this.chartData.datasets.push({
      data: [],
      label: 'Open',
      borderColor: '#3e95cd',
      borderWidth: 2,
      fill: false
    });
    this.chartData.datasets.push({
      data: [],
      label: 'Close',
      borderColor: '#8e5ea2',
      borderWidth: 2,
      fill: false
    });
    this.chartData.datasets.push({
      data: [],
      label: 'High',
      borderColor: '#3cba9f',
      borderWidth: 2,
      fill: false
    });
    this.chartData.datasets.push({
      data: [],
      label: 'Low',
      borderColor: '#e8c3b9',
      borderWidth: 2,
      fill: false
    });
    // Key used to create entries along the x-axis
    for(let i = 0; i < companyHistory.snapshots.length; i++){
      // For each entry, add the time label onto the x-axis
      this.chartData.labels.push(companyHistory.snapshots[i].time);
      // For each dataset, plot the y-coordinate
      this.chartData.datasets[0].data.push(companyHistory.snapshots[i].open);
      this.chartData.datasets[1].data.push(companyHistory.snapshots[i].close);
      this.chartData.datasets[2].data.push(companyHistory.snapshots[i].high);
      this.chartData.datasets[3].data.push(companyHistory.snapshots[i].low);
    }
  }

  /**
   * This function is called when the user clicks Begin At Zero. It
   * changes the scaling of the graph, and re-loads the graph.
   */
  beginAtZeroClick(){
    // Already have chart's data, just need to re-load the graph
    // by changing the Y-axis
    this.loading = true;
    this.loadingMessage = 'Calibrating graph...';
    this.beginAtZero = !this.beginAtZero;
    this.chartData.options.scales.yAxes[0].ticks.beginAtZero = this.beginAtZero;
    this.displayGraph(this.chartData);
  }

  /**
   * This function is called whenever the user presses a button
   * to change the time interval for the graph.
   * 
   * @param mode Time interval for the graph.
   */
  modeSelectionClick(range: string){
    this.model.range = range;
    this.loadData();
  }
}
