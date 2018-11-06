import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { RequestInfo, RequestResponse } from '../../services/login/login.service';

@Component({
  selector: 'app-post-portfolio-modal',
  templateUrl: './post-portfolio-modal.component.html',
  styleUrls: ['./post-portfolio-modal.component.css']
})
export class PostPortfolioModalComponent {
  @Input() portfoliosComponent; // Page listing the portfolios

  model = {
    name: ''
  }

  searchSeqNum: number = 0;
  loading: boolean = false;
  loadingMessage: string = '';
  warningMessage: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private portfolioService: PortfolioService, private modalService: NgbModal,
    private router: Router) {

  }

  // Displays the modal for creating a portfolio
  open(content){
    this.loading = false;
    this.loadingMessage = '';
    this.warningMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.model.name = '';
    this.modalService.open(content, { centered: true }).result.then((result) => {

    }, (reason) => {

    });
  }

  /*
   * This function is called when the user clicks the
   * Save button in order to create the new portfolio.
   */
  saveClick(){
    this.warningMessage = '';
    this.successMessage = '';
    if(!this.model.name){
      this.warningMessage = 'Must enter a name.';
      return;
    }
    this.loading = true;
    this.loadingMessage = 'Posting portfolio...';
    this.portfolioService.postPortfolio(this.model.name, new RequestInfo(0, this, this.postPortfolioCallback));
  }

  /*
   * This function is called when the PortfolioService
   * has a response for creating the portfolio.
   * 
   * @param {RequestResponse} requestResponse: Response
   * from the PortfolioService for creating the Portfolio.
   */
  postPortfolioCallback(requestResponse: RequestResponse) : void {
    var self = requestResponse.requestInfo.self;
    self.loading = false;
    self.loadingMessage = '';
    // Error creating the portfolio
    if(requestResponse.response.error){
      self.errorMessage = requestResponse.response.error;
      return;
    }
    self.successMessage = 'Portfolio created.';
    // Portfolio created, tell the portfolios component page to
    // reload it's portfolios
    self.portfoliosComponent.getPortfolios();
  }

}
