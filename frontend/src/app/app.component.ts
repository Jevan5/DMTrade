import { Component } from '@angular/core';
import { LoginService } from './services/login/login.service';
import { Config } from 'protractor';
import { Title } from '../../node_modules/@angular/platform-browser';
import { RequestInfo } from 'src/assets/requests/request-info';
import { RequestResponse } from 'src/assets/requests/request-response';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DMTrade';
  loginHeader;
  loadingMessage: string = 'Loading application...';
  loading: boolean = false;

  constructor(private loginService: LoginService, private titleService: Title){
    this.titleService.setTitle(this.title);

    // this.loginService.autoLogin(new RequestInfo(0, this, (r: RequestResponse) => {
    //   this.loading = false;
    // }));
  }

  ngOnInit(){
    
  }
}
