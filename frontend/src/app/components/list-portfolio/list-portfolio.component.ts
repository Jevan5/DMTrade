import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { PortfolioService } from '../../services/portfolio/portfolio.service';

@Component({
  selector: 'app-list-portfolio',
  templateUrl: './list-portfolio.component.html',
  styleUrls: ['./list-portfolio.component.css']
})
export class ListPortfolioComponent {
  @Input() portfoliosComponent;
  @Input() portfolio;

  constructor(private router: Router, private portfolioService: PortfolioService) {

  }

  viewPortfolio(){
    this.portfolioService.selectedPortfolio = this.portfolio;
    this.router.navigate(['/viewPortfolio']);
  }

}
