import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';

@Component({
  selector: 'app-view-portfolio',
  templateUrl: './view-portfolio.component.html',
  styleUrls: ['./view-portfolio.component.css']
})
export class ViewPortfolioComponent {
  portfolio;
  portfolioWorth = 0;
  trades = [];

  constructor(private loginService: LoginService, private portfolioService: PortfolioService,
    private router: Router) {
    if(!this.loginService.loggedIn){
      this.router.navigate(['/login']);
      return;
    }
    this.portfolio = this.portfolioService.selectedPortfolio;
    // Sort the buys and sells in order of timestamp.
    // The buys and sells are each already ordered by themselves,
    // but need to concatenate the arrays in a sorted manner
    let buyIndex = 0;
    let sellIndex = 0;
    while(true){
      // Covered all buys, add the sells
      if(buyIndex === this.portfolio.buys.length){
        for(; sellIndex < this.portfolio.sells.length; sellIndex++){
          this.trades.push(this.portfolio.sells[sellIndex]);
        }
        break;
      }
      // Covered all sells, add the buys
      else if(sellIndex === this.portfolio.sells.length){
        for(; buyIndex < this.portfolio.buys.length; buyIndex++){
          this.trades.push(this.portfolio.buys[buyIndex]);
        }
        break;
      }
      // Haven't covered all of either buys or sells
      else{
        if(this.portfolio.buys[buyIndex].timeStamp < this.portfolio.sells[sellIndex].timeStamp){
          this.trades.push(this.portfolio.buys[buyIndex]);
          buyIndex++;
        }
        else{
          this.trades.push(this.portfolio.sells[sellIndex]);
          sellIndex++;
        }
      }
    }
  }

}
