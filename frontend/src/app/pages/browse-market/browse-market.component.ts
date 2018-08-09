import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { MarketService } from '../../services/market/market.service';
import { Config } from 'protractor';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-browse-market',
  templateUrl: './browse-market.component.html',
  styleUrls: ['./browse-market.component.css']
})
export class BrowseMarketComponent {
  @ViewChild('canvas') canvas: ElementRef;
  model = {
    symbolToSearch: "",
    mode: "threeMonths" // { oneDay, oneMonth, threeMonths, sixMonths, oneYear, fiveYears }
  };
  symbol: string;
  chartData;
  options;
  chart;
  error: string;
  loading: boolean;
  beginAtZero: boolean = false;
  applicationError = 'Application error. Please try re-loading the page.';

  constructor(private marketService: MarketService, private portfolioService: PortfolioService,
    private elementRef: ElementRef) {

  }

  searchClick(){
    if(!this.model.symbolToSearch){
      return;
    }
    this.symbol = this.model.symbolToSearch.toUpperCase();
    this.loadData();
  }

  loadData(){
    this.loading = true;
    this.chartData = null;
    if(this.chart){
      this.chart.destroy();
    }
    this.chart = null;
    this.error = null;
    if(this.model.mode === 'oneDay'){
      this.marketService.getOneDayMarket(this.symbol, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'oneMonth'){
      this.marketService.getMonthsMarket(this.symbol, 1, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'threeMonths'){
      this.marketService.getMonthsMarket(this.symbol, 3, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'sixMonths'){
      this.marketService.getMonthsMarket(this.symbol, 6, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'oneYear'){
      this.marketService.getMonthsMarket(this.symbol, 12, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'twoYears'){
      this.marketService.getMonthsMarket(this.symbol, 24, this, this.loadDataCallback);
    }
    else if(this.model.mode === 'fiveYears'){
      this.marketService.getMonthsMarket(this.symbol, 60, this, this.loadDataCallback);
    }
    else{
      this.error = this.applicationError;
      this.loading = false;
    }
  }

  loadDataCallback(self, response){
    if(response.error){
      self.error = response.error;
      self.loading = false;
      return;
    }
    if(response["Error Message"]){
      self.error = 'Please enter a valid symbol.';
      self.loading = false;
      return;
    }
    self.chartData = self.prepareData(response);
    self.displayGraph();
  }

  displayGraph(){
    if(this.chart){
      this.chart.destroy();
    }
    this.chart = new Chart('canvas', this.chartData);
    this.loading = false;
  }

  /*
    Generates chart data that can be used to create a chart.

    Parameters:
    data (Object): API response containing stock information

    Returns:
    Object: Object in the form acceptable to create a Chart object from
  */
  prepareData(data){
    let chartData = {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
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
    chartData.data.datasets.push({
      data: [],
      label: 'Open',
      borderColor: '#3e95cd',
      borderWidth: 2,
      fill: false
    });
    chartData.data.datasets.push({
      data: [],
      label: 'Close',
      borderColor: '#8e5ea2',
      borderWidth: 2,
      fill: false
    });
    chartData.data.datasets.push({
      data: [],
      label: 'High',
      borderColor: '#3cba9f',
      borderWidth: 2,
      fill: false
    });
    chartData.data.datasets.push({
      data: [],
      label: 'Low',
      borderColor: '#e8c3b9',
      borderWidth: 2,
      fill: false
    });
    // Key used to create entries along the x-axis
    let timeKey;
    if(this.model.mode === 'oneDay'){
      timeKey = 'minute';
    }
    else{
      timeKey = 'date';
    }
    for(let i = 0; i < data.length; i++){
      // For each entry, add the time label onto the x-axis
      chartData.data.labels.push(data[i][timeKey]);
      // For each dataset, plot the y-coordinate
      chartData.data.datasets[0].data.push(parseFloat(data[i]['open']));
      chartData.data.datasets[1].data.push(parseFloat(data[i]['close']));
      chartData.data.datasets[2].data.push(parseFloat(data[i]['high']));
      chartData.data.datasets[3].data.push(parseFloat(data[i]['low']));
    }

    return chartData;
  }

  beginAtZeroClick(){
    // Already have chart's data, just need to re-load the graph
    // by changing the Y-axis
    this.loading = true;
    this.beginAtZero = !this.beginAtZero;
    this.chartData.options.scales.yAxes[0].ticks.beginAtZero = this.beginAtZero;
    this.displayGraph();
  }

  modeSelectionClick(mode){
    this.model.mode = mode;
    this.loadData();
  }
}
