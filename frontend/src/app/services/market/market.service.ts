import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService, RequestInfo, RequestResponse } from '../login/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  urlH: string = environment.marketURL;       // URL head
  urlT: string = '/batch?types=chart&range='; // URL tail
  limit: number = 100;
  bidAskRatio: number = 1.01;
  ranges: Array<string> = ["1 Day", "1 Month", "3 Months", "6 Months", "1 Year", "2 Years", "5 Years"];

  constructor(private loginService: LoginService, private http: HttpClient) {}

  /*
   * Gets a company's stock information.
   */
  getMarket(symbol: string, range: string, requestInfo: RequestInfo) : void {
    if(range == null || this.ranges.indexOf(range) === -1){
      if(range == null){
        range = (range === null) ? "null" : "undefined";
      }
      requestInfo.respond({
        error: 'range must be in ' + this.ranges.toString() + '. range = ' + range
      });
      return;
    }
    if(range === this.ranges[0]){
      this.getOneDayMarket(symbol, requestInfo);
    }
    else {
      this.getMonthsMarket(symbol, range, requestInfo);
    }
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
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  private getOneDayMarket(symbol: string, requestInfo: RequestInfo) : void {
    if(!symbol){
      requestInfo.respond({
        error: 'symbol must be non-empty string.'
      });
      return;
    }
    this.http.get(this.urlH + symbol + this.urlT + '1d').subscribe((data: Config) => {
      if(!data["chart"]){
        requestInfo.respond({
          error: "data has no member 'chart'."
        });
        return;
      }
      try{
        var trimmedData = this.trimData(data["chart"]);
        var companyHistory = new CompanyHistory(symbol.toUpperCase(), trimmedData, '1Day');
        requestInfo.respond(companyHistory);
      }
      catch(e) {
        requestInfo.respond({
          error: e.message
        });
      }
    }, error => {
      requestInfo.respond({
        error: error.statusText
      });
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
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  private getMonthsMarket(symbol: string, range: string, requestInfo: RequestInfo) : void {
    let timeRange: string;
    if(range === this.ranges[1]){
      timeRange = "1m";
    }
    else if(range === this.ranges[2]){
      timeRange = "3m";
    }
    else if(range === this.ranges[3]){
      timeRange = "6m";
    }
    else if(range === this.ranges[4]){
      timeRange = "1y";
    }
    else if(range === this.ranges[5]){
      timeRange = "2y";
    }
    else if(range === this.ranges[6]){
      timeRange = "5y";
    }

    this.http.get(this.urlH + symbol + this.urlT + timeRange).subscribe((data: Config) => {
      if(!data["chart"]){
        requestInfo.respond({
          error: "data has no member 'chart'."
        });
        return;
      }
      try{
        var trimmedData = this.trimData(data["chart"]);
        var companyHistory = new CompanyHistory(symbol.toUpperCase(), trimmedData, timeRange);
        requestInfo.respond(companyHistory);
      }
      catch(e) {
        requestInfo.respond({
          error: e.message
        });
      }
    }, error => {
      requestInfo.respond({
        error: error.statusText
      });
    });
  }

  /*
   * Trims the data down to around this.limit entries.
   * 
   * @param {Array<Object>} data: A long list, that will be copied with
   * certain elements excluded to reduce the new array's length
   * @returns {Array<Object>}: A shortened list, being a subset of data.
   */
  trimData(data: Array<Object>) : Array<Object> {
    // Trimmed data to return
    let trimmed = [];
    // How many elements to skip before copying another element
    // from data into trimmed
    let skips = Math.floor(data.length / this.limit);

    // Iterate over all elements
    for(let i = 0; i < data.length; i++){
      // Time to copy an element, not skipping this one
      if(i % (skips + 1) === 0){
        trimmed.push(data[i]);
      }
    }

    return trimmed;
  }

  /*
   * Gets the highest price that someone is willing to
   * buy shares for a particular stock. Response is in the
   * form:
   * {
   *  error: string,
   *  searchSeqNum: number,
   *  bidPrice: number
   * }
   * 
   * @param {string} symbol: The company's symbol you'd like to get
   * the current bid price for.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */ 
  getBidPrice(symbol: string, requestInfo: RequestInfo) : void {
    if(!symbol){
      requestInfo.respond({
        error: 'symbol must be a non-empty string.'
      });
      return;
    }
    this.http.get(this.urlH + symbol + this.urlT + '1d').subscribe((data: Config) => {
      if(!data["chart"]){
        requestInfo.respond({
          error: "data has no member 'chart'."
        });
        return;
      }
      if(!data["chart"].length || data["chart"].length === 0){
        requestInfo.respond({
          error: 'data is not a non-empty Array.'
        });
        return;
      }
      let day = data["chart"][data["chart"].length - 1];
      if(!day.hasOwnProperty('marketHigh') || typeof(day['marketHigh']) !== 'number'){
        requestInfo.respond({
          error: "data['chart'] has no field 'marketHigh' of type 'number'."
        });
        return;
      }
      if(!day.hasOwnProperty('marketLow') || typeof(day['marketLow']) !== 'number'){
        requestInfo.respond({
          error: "data['chart'] has no field 'marketLow' of type 'number'."
        });
        return;
      }
      requestInfo.respond({bidPrice: Math.round((day["marketHigh"] + day["marketLow"]) / 2 / 1.01 * 100) / 100});
    }, error => {
      requestInfo.respond({
        error: error.statusText
      });
    });
  }

  /*
   * Gets the lowest price that someone is willing to
   * sell shares for a particular stock. Response is in the form:
   * {
   *  error: string,
   *  searchSeqNum: number,
   *  askPrice: number
   * }
   * 
   * @param {string} symbol: The company's symbol you'd like to get
   * the current ask price for.
   * @param {number} searchSeqNum: The sequence number associated with
   * the search to the API. Pass it through the callback, so the
   * listener can keep track of when the call was first requested
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */ 
  getAskPrice(symbol: string, requestInfo: RequestInfo) : void {
    if(!symbol){
      requestInfo.respond({
        error: 'symbol must be a non-empty string.'
      });
      return;
    }
    this.http.get(this.urlH + symbol + this.urlT + '1d').subscribe((data: Config) => {
      if(!data["chart"] || !data["chart"].length || data["chart"].length === 0){
        requestInfo.respond({
          error: "data has no field 'chart' of type 'Array'."
        });
        return;
      }
      let day = data["chart"][data["chart"].length - 1];
      if(!day.hasOwnProperty('marketHigh') || typeof(day['marketHigh']) !== 'number'){
        requestInfo.respond({
          error: "data['chart'] has no field 'marketHigh' of type 'number'."
        });
        return;
      }
      if(!day.hasOwnProperty('marketLow') || typeof(day['marketLow']) !== 'number'){
        requestInfo.respond({
          error: "data['chart'] has no field 'marketLow' of type 'number'."
        });
        return;
      }
      requestInfo.respond(Math.round((day["marketHigh"] + day["marketLow"]) / 2 * 1.01 * 100) / 100);
    }, error => {
      requestInfo.respond({
        error: error.statusText
      });
    });
  }

  /*
   * This function finds the current price of all the
   * symbols searched for.
   * 
   * @param {Array<string>} symbols: List of symbols to get
   * the prices for.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  requestPrices(symbols: Array<string>, requestInfo: RequestInfo) : void {
    if(symbols == null){
      requestInfo.respond({
        error: 'symbols = ' + (symbols === null) ? 'null' : 'undefined'
      });
      return;
    }
    if(requestInfo == null){
      requestInfo.respond({
        error: 'requestInfo = ' + (requestInfo === null) ? 'null' : 'undefined'
      });
      return;
    }

    let symbolToPriceMap: Map<string, number> = new Map<string, number>();
    if(symbols.length === 0){
      requestInfo.respond(symbolToPriceMap);
    }
    else{
      let url = this.urlH + 'market' + this.urlT + '1d&symbols=' + symbols[0];
      for(let i = 1; i < symbols.length; i++){
        url += ',' + symbols[i];
      }
      this.http.get(url).subscribe((data: Config) => {
        if(!data){
          console.trace();
          requestInfo.respond({
            error: 'data=' + data
          });
          return;
        }
        // Iterate over the symbols
        for(let key in data) {
          // Found a symbol
          if(data.hasOwnProperty(key)){
            if(!data[key].hasOwnProperty('chart')){
              console.trace();
              requestInfo.respond({
                error: "data[" + key + "].hasOwnProperty('chart')=FALSE"
              });
              return;
            }
            let chart = data[key].chart;
            if(chart.length === 0){
              console.trace();
              requestInfo.respond({
                error: "data[" + key + "].chart.length=0"
              });
              return;
            }
            let index = data[key].chart.length - 1
            let latestSnapshot = data[key].chart[index];
            if(!latestSnapshot.hasOwnProperty('average')){
              console.trace();
              requestInfo.respond({
                error: "data[" + key + "].chart[" + index.toString() + "].hasOwnProperty('average')=FALSE"
              });
              return;
            }
            symbolToPriceMap.set(key, data[key].chart[index].average);
          }
        }
        requestInfo.respond(symbolToPriceMap);
      });
    }
  }

  /*
   * This function finds the historical prices of all the
   * symbols searched for.
   * 
   * @param {Array<string>} symbols: List of symbols to get
   * the historical prices for.
   * @param {string} range: Range to find the prices for.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  requestHistoricalPrices(symbols: Array<string>, range: string, requestInfo: RequestInfo) : void {
    if(symbols == null){
      requestInfo.respond({
        error: 'symbols = ' + (symbols === null) ? 'null' : 'undefined'
      });
      return;
    }
    if(range == null){
      requestInfo.respond({
        error: 'range = ' + (symbols === null) ? 'null' : 'undefined'
      });
      return;
    }
    if(requestInfo == null){
      requestInfo.respond({
        error: 'requestInfo = ' + (symbols === null) ? 'null' : 'undefined'
      });
      return;
    }

    let symbolToPriceMaps = new Array<Map<string, number>>();

    if(symbols.length === 0){
      requestInfo.respond(symbolToPriceMaps);
    }
    else {

    }
  }
}

/*
 * This class is used to store historical data for a company.
 * This data fits well with graphing applications, presenting
 * opening, closing, high, and low values over minutes,
 * days, months, and even years of time.
 */
export class CompanyHistory {
  public symbol: string;
  public snapshots: Array<{
    open: number,   // opening value of the stock during the time period
    close: number,  // closing value of the stock during the time period
    high: number,   // highest value of the stock during the time period
    low: number,    // lowest value of the stock during the time period
    time: string    // the point in time that this data highlights the company
  }>;
  public range: string; // the interval of time segments that the snapshots occur

  constructor(symbol: string, chart: Config, range: string){
    this.symbol = symbol;
    this.range = range;
    if(chart.length === 0){
      throw new Error('chart must be non-empty Array.');
    }

    let timeKey;
    if(chart[0].hasOwnProperty('minute')){
      timeKey = 'minute';
    }
    else if(chart[0].hasOwnProperty('date')){
      timeKey = 'date';
    }
    else{
      throw new Error("chart elements must have either 'minute' or 'date' properties.")
    }

    this.snapshots = new Array<{
      open: number,
      close: number,
      high: number,
      low: number,
      time: string
    }>();

    let fields = ['open', 'close', 'high', 'low', timeKey];

    for(let i = 0; i < chart.length; i++){
      for(let j = 0; j < fields.length; j++){
        if(!chart[i].hasOwnProperty(fields[j])){
          console.trace();
          throw new Error(chart[i].toString() + " is missing field '" + fields[j] + "'.");
        }
      }
      this.snapshots.push({
        open: chart[i]['open'],
        close: chart[i]['close'],
        high: chart[i]['high'],
        low: chart[i]['low'],
        time: chart[i][timeKey]
      });
    }
  }
}