import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  url = 'http://127.0.0.1:8080';
  selectedPortfolio;  // Last selected portfolio, for when a user navigates to the ViewPortfolio page

  constructor(private http: HttpClient, private router: Router,
    private loginService: LoginService) {

  }

  // Deletes a portfolio for an account, passes the
  // API response through the callback
  deletePortfolio(portfolio_id, self, callback){
    // Not logged in
    if(!this.loginService.loggedIn){
      callback(self, {
        error: 'Not logged in.'
      });
      return;
    }

    this.http.delete(this.url + '/portfolios/' + portfolio_id, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      callback(self, data);
    }, error => {
      callback(self, error);
    });
  }

  // Gets a list of portfolios that belong to the
  // account, passes them through the callback
  getPortfolios(self, callback){
    // Not logged in
    if(!this.loginService.loggedIn){
      callback(self, {
        error: 'Not logged in.'
      });
      return;
    }

    this.http.get(this.url + '/portfolios', {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      callback(self, data);
    }, error => {
      callback(self, error);
    });
  }

  // Creates a portfolio for an account,
  // passes the response through the callback
  postPortfolio(name, self, callback){
    // Not logged in
    if(!this.loginService.loggedIn){
      callback(self, {
        error: 'Not logged in.'
      });
      return;
    }
    this.http.post(this.url + '/portfolios', {
      name: name
    }, {
      headers: new HttpHeaders({
        'security_id': this.loginService.security._id,
        'hashPass': this.loginService.password
      })
    }).subscribe((data: Config) => {
      callback(self, data);
    }, error => {
      callback(self, error);
    });
  }
}
