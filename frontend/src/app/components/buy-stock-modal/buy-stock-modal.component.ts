import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { LoginService } from '../../services/login/login.service';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { Portfolio } from '../../models/portfolio';
import { MarketService } from '../../services/market/market.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-buy-stock-modal',
  templateUrl: './buy-stock-modal.component.html',
  styleUrls: ['./buy-stock-modal.component.css']
})
export class BuyStockModalComponent{
  @Input() symbol;
  @ViewChild('content') private content;

  model: {
    price: number,
    quantity: string,
    portfolios: Array<Portfolio>,
    selectedPortfolio: Portfolio
  };
  open: boolean = false;
  messages: {
    error: string,
    warning: string,
    loading: string,
    success: string
  };
  interval: number = 10000; // ms of how often to check API for ask price
  searchSeqNum: number = 0; // sequence number to keep track of calls to get ask price

  constructor(private portfolioService: PortfolioService, private modalService: NgbModal,
    private marketService: MarketService) {
    this.model = {
      price: null,
      quantity: null,
      portfolios: new Array<Portfolio>(),
      selectedPortfolio: null
    };
    this.messages = {
      error: '',
      warning: '',
      loading: '',
      success: ''
    };
  }

  /**
   * This function queries the PortfolioService
   * for the portfolios of the user.
   */
  queryPortfolios() : void {
    this.messages.loading = 'Loading portfolios...';
    this.searchSeqNum++;
    this.portfolioService.requestPortfolios(new RequestInfo(this.searchSeqNum, this, (requestResponse: RequestResponse) => {
      console.log(requestResponse);
      var self = requestResponse.requestInfo.self;
      // Modal is no longer opened
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
      // PortfolioService had an issue retrieving the
      // portfolios of the user
      if(requestResponse.response.error){
        self.messages.error = requestResponse.response.error;
      }
      if(self.messages.error){
        self.messages.loading = '';
        return;
      }

      self.model.portfolios = requestResponse.response.portfolios;
      self.messages.loading = 'Loading ask price...';
      self.searchSeqNum++;
      self.marketService.getAskPrice(self.symbol, new RequestInfo(self.searchSeqNum, self, self.queryAskPriceCallback));
    }));
  }

  /**
   * This function is called when the MarketService has
   * a response to the ask price query. It then
   * makes another request for the ask price some
   * time later.
   * 
   * @param requestResponse Response from
   * the MarketService for getting the ask price.
   */
  queryAskPriceCallback(requestResponse: RequestResponse) : void {
    console.log(requestResponse);
    var self = requestResponse.requestInfo.self;
    // Modal is no longer opened
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
    // MarketService had an issue retrieving the
    // ask price
    if(requestResponse.response.error){
      self.messages.error = requestResponse.response.error;
    }
    // An error has occurred
    if(self.messages.error){
      return;
    }

    self.model.price = requestResponse.response;
    self.messages.loading = '';

    setTimeout(() => {
      self.searchSeqNum++;
      self.marketService.getAskPrice(self.symbol, new RequestInfo(self.searchSeqNum, self, self.queryAskPriceCallback));
    }, self.interval);
  }

  /**
   * This function is called when the user clicks the Buy button. The
   * data required such as portfolios and ask price are loaded,
   * and the modal is opened.
   */
  buyClick() : void {
    this.openModal();
  }

  /**
   * This function re-opens the modal, and starts loading
   * data such as the user's portfolios.
   */
  openModal() : void {
    this.open = true;
    this.messages.warning = '';
    this.messages.success = '';
    this.messages.error = '';
    this.messages.loading = '';
    this.model.selectedPortfolio = null;
    this.model.quantity = null;
    this.queryPortfolios();
    // Open the modal
    this.modalService.open(this.content, { centered: true }).result.then((result) => {
      this.open = false;
    }, (reason) => {
      this.open = false;
    });
  }

  /**
   * This function is called when the user clicks the
   * Save button. An attempt to place the bid is made.
   */
  saveClick() : void {
    // User hasn't selected a portfolio
    if(!this.model.selectedPortfolio){
      this.messages.warning = 'Must select a portfolio.';
      return;
    }
    // User has not entered a numeric quantity to purchase
    if(!this.model.quantity || isNaN(parseInt(this.model.quantity))){
      this.messages.warning = 'Must enter a numeric quantity.';
      return;
    }

    this.messages.warning = '';
    this.messages.loading = "Placing bid...";
    this.portfolioService.postBid(this.symbol, parseInt(this.model.quantity), this.model.price,
      this.model.selectedPortfolio.get_id(), new RequestInfo(0, this, (requestResponse: RequestResponse) => {
      var self = requestResponse.requestInfo.self;
      self.messages.loading = '';
      if(requestResponse.response.error){
        self.messages.error = 'Could not place the bid: ' + requestResponse.response.error;
        return;
      }

      self.messages.success = 'Placed bid.';
    }));
  }
}
