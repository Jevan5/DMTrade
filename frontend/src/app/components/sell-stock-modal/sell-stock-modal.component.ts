import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { LoginService } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { MarketService } from '../../services/market/market.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { Portfolio } from '../../models/portfolio';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';

@Component({
  selector: 'app-sell-stock-modal',
  templateUrl: './sell-stock-modal.component.html',
  styleUrls: ['./sell-stock-modal.component.css']
})
export class SellStockModalComponent{
  @Input() symbol;
  @ViewChild('content') private content;

  model: {
    price: number,
    quantity: string,
    portfolioAndShares: {
      key: Portfolio,
      value: number
    }
  };

  open: boolean;
  messages: {
    loading: string,
    success: string,
    warning: string,
    error: string
  };
  interval: number;                             // Milliseconds of how often to query for bid price
  searchSeqNum: number;                         // Sequence number to keep track of calls to get bid price
  portfoliosAndShares: Map<Portfolio, number>;  // Showing how many shares are owned by each portfolio for the user

  constructor(private portfolioService: PortfolioService, private modalService: NgbModal,
    private marketService: MarketService) {
    this.model = {
      price: null,
      quantity: null,
      portfolioAndShares: {
        key: null,
        value: null
      }
    };
    this.open = false;
    this.messages = {
      loading: '',
      success: '',
      warning: '',
      error: ''
    };
    this.searchSeqNum = 0;
    this.interval = 10000;
  }

  /**
   * This function queries the PortfolioService for
   * the portfolios of the user.
   */
  queryPortfolios() : void {
    this.model.portfolioAndShares.key = null;
    this.model.portfolioAndShares.value = null;
    this.model.quantity = null;
    this.messages.loading = 'Loading portfolios...';
    this.searchSeqNum++;
    this.portfolioService.requestPortfolios(new RequestInfo(this.searchSeqNum, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      // Modal is no longer open
      if(!self.open){
        self.messages.loading = '';
        self.messages.error = '';
        self.messages.warning = '';
        self.messages.success = '';
        return;
      }
      // Expired response
      if(requestResponse.requestInfo.searchSeqNum !== self.searchSeqNum){
        return;
      }
      // Problem with retrieving the portfolios
      if(requestResponse.response.error){
        self.messages.error = requestResponse.response.error;
      }
      // Error has been raised
      if(self.messages.error){
        self.messages.loading = '';
        return;
      }
      self.portfoliosAndShares = Portfolio.getSharesOwnedByPortfolios(self.symbol, new Set<Portfolio>(requestResponse.response));
      self.messages.loading = 'Loading bid price...';
      self.searchSeqNum++;
      self.marketService.getBidPrice(self.symbol, new RequestInfo(self.searchSeqNum, self, self.queryBidPriceCallback));
    }));
  }

  /**
   * This function is called when the MarketService
   * has a response to the query for the bid price.
   * It then queries the MarketService again for
   * the bidPrice every so often.
   * 
   * @param requestResponse Response from the PortfolioService
   * for getting the user's portfolios.
   */
  queryBidPriceCallback(requestResponse: RequestResponse) : void {
    var self = requestResponse.requestInfo.self;
    // Modal is not open
    if(!self.open){
      self.messages.loading = '';
      self.messages.error = '';
      self.messages.warning = '';
      self.messages.success = '';
      return;
    }
    // Response is stale
    if(requestResponse.requestInfo.searchSeqNum !== self.searchSeqNum){
      return;
    }
    // MarketService had an issue retrieving the bid price
    if(requestResponse.response.error){
      self.messages.error = requestResponse.response.error;
    }
    // An error has been raised
    if(self.messages.error){
      self.messages.loading = '';
      return;
    }

    self.model.price = requestResponse.response.bidPrice;
    self.messages.loading = '';

    // Query for the bid price later again
    setTimeout(() => {
      self.searchSeqNum++;
      self.marketService.getBidPrice(self.symbol, new RequestInfo(self.searchSeqNum, self, self.queryBidPriceCallback));
    }, self.interval);
  }

  /**
   * This function is called when the user clicks the Sell button.
   * It triggers the retrieval of the portfolios, which then
   * triggers the ongoing retrieval of the bid price for the stock.
   * Then opens the modal once everything has started loading.
   */
  sellClick(){
    this.openModal();
  }

  /**
   * This function re-opens the modal, and starts loading
   * data such as the user's portfolios.
   */
  openModal(){
    this.open = true;
    this.messages.warning = '';
    this.messages.success = '';
    this.messages.error = '';
    this.queryPortfolios();
    // Open the modal
    this.modalService.open(this.content, { centered: true }).result.then((result) => {
      this.open = false;
    }, (reason) => {
      this.open = false;
    });
  }

  /**
   * This function is called when the user clicks the Save button
   * in the modal. A request to post an ask to the API will be made.
   */
  saveClick(){
    if(!this.model.quantity || parseInt(this.model.quantity) == NaN){
      this.messages.warning = 'Must enter a numeric quantity.';
      return;
    }
    if(!this.model.portfolioAndShares.key){
      this.messages.warning = 'Must select a portfolio.';
      return;
    }
    if(parseInt(this.model.quantity) > this.model.portfolioAndShares.value){
      this.messages.warning = "You don't own that many shares.";
      return;
    }
    this.messages.warning = '';
    this.messages.success = '';
    this.messages.loading = "Placing ask...";
    this.portfolioService.postAsk(this.symbol, parseInt(this.model.quantity), this.model.price,
      this.model.portfolioAndShares.key.get_id(), new RequestInfo(0, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      self.messages.loading = '';
      if(requestResponse.response.error){
        self.messages.error = 'Could not place the ask: ' + requestResponse.response.error;
        return;
      }
  
      self.messages.success = 'Placed ask.';
  
      self.queryPortfolios();
    }));
  }
}
