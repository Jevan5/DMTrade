import { Component } from '@angular/core';
import { LoginService } from './services/login/login.service';
import { Config } from 'protractor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DMTrade';
  securities = [];
  accounts = [];
  portfolios = [];
  loginHeader;

  constructor(private loginService: LoginService){
    this.loginService.loginObservable.subscribe((data: Config) => {
      this.loginHeader = data;
    });
  }

  ngOnInit(){
    
  }
}
