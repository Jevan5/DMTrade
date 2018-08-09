import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { PortfolioService } from '../../services/portfolio/portfolio.service';

@Component({
  selector: 'app-delete-portfolio',
  templateUrl: './delete-portfolio.component.html',
  styleUrls: ['./delete-portfolio.component.css']
})
export class DeletePortfolioComponent {
  @Input() portfoliosComponent; // Portfolios page, listing all of the portfolios
  @Input() portfolio;           // The portfolio that this component helps to delete

  constructor(private portfolioService: PortfolioService) {
    
  }

  // User has selected the button to delete the portfolio
  deleteClick(){
    this.portfolioService.deletePortfolio(this.portfolio._id, this, this.deletePortfolioCallback);
  }

  deletePortfolioCallback(self, response){
    // Problem deleting the portfolio
    if(response.error){
      alert(response.error);
      return;
    }
    // After portfolio has been deleted, have the portfolios page
    // reload it's list of portfolios
    self.portfoliosComponent.getPortfolios();
  }

}