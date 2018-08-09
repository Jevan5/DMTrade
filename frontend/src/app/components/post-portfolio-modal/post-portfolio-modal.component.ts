import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { PortfolioService } from '../../services/portfolio/portfolio.service';

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

  constructor(private portfolioService: PortfolioService, private modalService: NgbModal,
    private router: Router) {

  }

  // Displays the modal for creating a portfolio
  open(content){
    this.modalService.open(content, { centered: true }).result.then((result) => {
      // Name of the portfolio is not given
      if(!this.model.name){
        return;
      }
      // Call the portfolioService to create the portfolio
      this.portfolioService.postPortfolio(this.model.name, this, this.postPortfolioCallback);
    });
  }

  // Function called after portfolioService has tried to create the portfolio
  postPortfolioCallback(self, response){
    // Error creating the portfolio
    if(response.error){
      alert(response.error);
      return;
    }
    // Portfolio created, tell the portfolios component page to
    // reload it's portfolios
    self.portfoliosComponent.getPortfolios();
  }

}
