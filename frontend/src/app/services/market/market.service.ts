import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  urlH = 'https://api.iextrading.com/1.0/stock/';  // URL head
  urlT = '/batch?types=chart&range=';             // URL tail
  limit = 100;

  constructor(private loginService: LoginService, private http: HttpClient) {

  }

  /* 
   * Get a company's stock information from the current/last trading day.
   * 
   * The API response will be in the form:
   *  {
   *    "chart": [{
   *      "date": "20180808",
   *      "minute": "09:30",
   *      "label": "09:30 AM",
   *      "high": 206.4,
   *      "low": 205.79,
   *      "average": 206.073,
   *      "volume": 9778,
   *      "notional": 2014986.645,
   *      "numberOfTrades": 107,
   *      "marketHigh": 206.428,
   *      "marketLow": 205.76,
   *      "marketAverage": 206.06,
   *      "marketVolume": 926629,
   *      "marketNotional": 190941286.4103,
   *      "marketNumberOfTrades": 3416,
   *      "open": 206.09,
   *      "close": 205.79,
   *      "marketOpen": 206.08,
   *      "marketClose": 205.92,
   *      "changeOverTime": 0,
   *      "marketChangeOverTime": 0
   *    }, {
   *      "date": "20180808",
   *      "minute": "09:31",
   *      "label": "09:31 AM",
   *      "high": 206.44,
   *      "low": 205.92,
   *      "average": 206.183,
   *      "volume": 3950,
   *      "notional": 814424.65,
   *      "numberOfTrades": 28,
   *      "marketHigh": 206.45,
   *      "marketLow": 205.9,
   *      "marketAverage": 206.208,
   *      "marketVolume": 134887,
   *      "marketNotional": 27814721.5429,
   *      "marketNumberOfTrades": 1084,
   *      "open": 205.92,
   *      "close": 206.13,
   *      "marketOpen": 205.92,
   *      "marketClose": 206.091,
   *      "changeOverTime": 0.0005337914234275486,
   *      "marketChangeOverTime": 0.0007182374065805888
   *    }]
   *  }
   * 
   * @param {string} symbol: The company's symbol you'd like to view
   * information for.
   * @param {Object} self: Reference to the caller of the function.
   * @param {function} callback: Function to pass the API response to.
   */
  getOneDayMarket(symbol: string, self, callback){
    if(!symbol){
      callback(self, {
        error: 'symbol must be non-empty string.'
      });
      return;
    }
    this.http.get(this.urlH + symbol + this.urlT + '1d').subscribe((data: Config) => {
      callback(self, this.trimData(data.chart));
    }, error => {
      callback(self, error);
    });
  }

  /*
   * Get a company stock information from the last specified months of operation.
   * 
   * The API response will be in the form:
   * 
   *  {
   *    "chart": [{
   *      "date": "2018-07-09",
   *      "open": 189.5,
   *      "high": 190.68,
   *      "low": 189.3,
   *      "close": 190.58,
   *      "volume": 19756634,
   *      "unadjustedVolume": 19756634,
   *      "change": 2.61,
   *      "changePercent": 1.389,
   *      "vwap": 190.19,
   *      "label": "Jul 9",
   *      "changeOverTime": 0
   *    }, {
   *      "date": "2018-07-10",
   *      "open": 190.71,
   *      "high": 191.28,
   *      "low": 190.1801,
   *      "close": 190.35,
   *      "volume": 15939149,
   *      "unadjustedVolume": 15939149,
   *      "change": -0.23,
   *      "changePercent": -0.121,
   *      "vwap": 190.6699,
   *      "label": "Jul 10",
   *      "changeOverTime": -0.001206842270962421
   *    }]
   *  }
   * 
   * @param {string} symbol: The company's symbol you'd like to view
   * information for.
   * @param {number} months: How many months back to view information for. Must
   * be in the set {1, 3, 6, 12, 24, 60}.
   * @param {Object} self: Reference to the caller of the function.
   * @param {function} callback: Function to pass the API response to.
   */
  getMonthsMarket(symbol: string, months: number, self, callback){
    if(!symbol){
      callback(self, {
        error: 'symbol must be a non-empty string.'
      });
      return;
    }
    if(months !== 1 && months !== 3 && months !== 6
      && months !== 12 && months !== 24 && months !== 60){
      callback(self, {
        error: 'months must be one of {1, 3, 6, 12, 24, 60}.'
      });
      return;
    }
    let timeRange;
    if(months <= 6){
      timeRange = months.toString() + 'm';
    }
    else{
      timeRange = (months / 12).toString() + 'y';
    }
    this.http.get(this.urlH + symbol + this.urlT + timeRange).subscribe((data: Config) => {
      callback(self, this.trimData(data.chart));
    }, error => {
      callback(self, error);
    });
  }

  /*
   * Trims the data down to around this.limit entries.
   * 
   * @param {Array} data: A long list, that will be copied with
   * certain elements excluded to reduce the new array's length
   * @returns {Array}: A shortened list, being a subset of data.
   */
  trimData(data){
    // Trimmed data to return
    let trimmed = [];
    // How many elements to skip before copying another element
    // from data into trimmed
    let skips = Math.floor(data.length / this.limit);
    console.log('skips:');
    console.log(skips);

    // Iterate over all elements
    for(let i = 0; i < data.length; i++){
      // Time to copy an element, not skipping this one
      if(i % (skips + 1) === 0){
        trimmed.push(data[i]);
      }
    }

    console.log('trimmed:');
    console.log(trimmed);

    return trimmed;
  }
}