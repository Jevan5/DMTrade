import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { callbackify } from 'util';
import { environment } from '../../../environments/environment';
import { Security } from '../../models/security';
import { RequestInfo } from '../../../assets/requests/request-info';
import { RequestResponse } from '../../../assets/requests/request-response';
import { Account } from 'src/app/models/account';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loggedIn: boolean = false; // Keeps track of if a user is logged in or not
  password: string = '';    // Keeps track of the password entered upon a successful login
  security: Security;         // Keeps track of the logged in user's security record
  account: Account;          // Keeps track of the logged in user's account record
  url: string = environment.dmTradeBackendURL;  // Backend of DMTrade
  emailCookieKey: string = 'DMTradeEmail';
  passwordCookieKey: string = 'DMTradePassword';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {

  }

  /**
   * This function is called when the LoginService is first created.
   * It tries to fetch a stored email and password from cookies in
   * order to automatically login for the user.
   * 
   * @param requestInfo Information regarding the request.
   */
  autoLogin(requestInfo: RequestInfo){
    let email = this.cookieService.get(this.emailCookieKey);
    if(!email){
      requestInfo.respond(null);
      return;
    }

    let password = this.cookieService.get(this.passwordCookieKey);
    if(!password){
      requestInfo.respond(null);
      return;
    }

    this.login(email, password, requestInfo);
  }

  /**
   * Performs a login by first getting the security
   * record associated with the email and password,
   * then trying to find the account record associated
   * with the security record. Passes the API response
   * to the callback.
   * 
   * @param email Email to login to.
   * @param password Password used to login.
   * @param requestInfo Information regarding
   * the request.
   */
  login(email: string, password: string, requestInfo: RequestInfo) : void {
    this.loading = true;
    // Query API to login
    this.http.get(this.url + 'securities/' + email + '/' + password).subscribe((data: Config) => {
      if (!data.hasOwnProperty('security')) {
        throw 'data = ' + data;
      }

      // Login successful
      this.security = new Security(data.security);
      this.password = password;
      if (!this.security.getAccount()) { // User hasn't set personal information yet
        requestInfo.respond(this.security);
        this.loading = false;
      } else { // User has already set personal information
        this.http.get(this.url + 'accounts', {
          headers: new HttpHeaders({
            'security_id': this.security.get_id(),
            'hashPass': this.password
          })
        }).subscribe((data: Config) => {
          if (!data.hasOwnProperty('account')) {
            throw 'data = ' + data;
          }

          let account = new Account(data.account);
          this.loggedIn = true;
          this.cookieService.set(this.emailCookieKey, email);
          this.cookieService.set(this.passwordCookieKey, password);
          requestInfo.respond({
            security: this.security,
            account: account
          });
          this.loading = false;
        }, error => {
          requestInfo.respond(error);
          this.loading = false;
        });
      }
    }, error => {
      requestInfo.respond(error);
      this.loading = false;
    });
  }

  /**
   * This function logs the user out.
   * 
   * @param requestInfo Information regarding
   * the request.
   */
  logout(requestInfo: RequestInfo) : void {
    this.security = null;
    this.account = null;
    this.password = '';
    this.loggedIn = false;
    this.cookieService.set(this.emailCookieKey, '');
    this.cookieService.set(this.passwordCookieKey, '');
    requestInfo.respond(null);
    this.router.navigate(['']);
  }

  /**
   * Creates a security record, passes the API
   * response to the callback.
   * 
   * @param email Email to register.
   * @param password Password of new account to
   * be registered.
   * @param requestInfo Information regarding
   * the request.
   */
  register(email: string, password: string, requestInfo: RequestInfo) : void {
    this.http.post(this.url + 'securities', {
      email: email,
      hashPass: password
    }).subscribe((data: Config) => {
      if (!data.hasOwnProperty('security')) {
        throw 'data = ' + data.toString();
      }

      requestInfo.respond(new Security(data.security));
    }, error => {
      requestInfo.respond(error);
    });
  }

  /**
   * This function is called when the user logs in for the
   * first time and fills in their personal information.
   * Their personal information is then sent to the API.
   * 
   * @param firstName First name of the user.
   * @param lastName Last name of the user.
   * @param requestInfo Information regarding
   * the request.
   */
  postUserInfo(firstName: string, lastName: string, requestInfo: RequestInfo) : void {
    if(!firstName || !lastName){
      requestInfo.respond({
        error: 'firstName and lastName must be non-empty strings.'
      });
      return;
    }
    this.http.post(this.url + 'accounts', {
      firstName: firstName,
      lastName: lastName
    }, {
      headers: new HttpHeaders({
        'security_id': this.security.get_id(),
        'hashPass': this.password
      })
    }).subscribe((data: Config) => {
      if (!data.hasOwnProperty('account')) {
        throw 'data = ' + data;
      }
      
      this.account = new Account(data.account);
      this.loggedIn = true;
      this.security.setAccount(this.account.get_id());
      this.router.navigate(['']);
      requestInfo.respond(this.account);
    }, error => {
      requestInfo.respond(error);
    });
  }
}