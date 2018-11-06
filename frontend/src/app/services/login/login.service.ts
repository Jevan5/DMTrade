import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { callbackify } from 'util';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loggedIn: boolean = false; // Keeps track of if a user is logged in or not
  loginObservable;  // Emits null if logging out, { service, account } if logging in
  password: string = '';    // Keeps track of the password entered upon a successful login
  security: Security;         // Keeps track of the logged in user's security record
  account: Account;          // Keeps track of the logged in user's account record
  url: string = 'http://127.0.0.1:8080';
  emailCookieKey: string = 'DMTradeEmail';
  passwordCookieKey: string = 'DMTradePassword';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {

    this.loginObservable = new Observable<any>((observer) => {
      this.loginObservable.observers.push(observer);

      return {
        unsubscribe(){
          
        }
      }
    });

    this.loginObservable.observers = [];
  }

  /*
   * This function is called when the LoginService is first created.
   * It tries to fetch a stored email and password from cookies in
   * order to automatically login for the user.
   */
  autoLogin(){
    let email = this.cookieService.get(this.emailCookieKey);
    if(!email){
      this.sendToObservers(null);
      return;
    }

    let password = this.cookieService.get(this.passwordCookieKey);
    if(!password){
      this.sendToObservers(null);
      return;
    }

    this.login(email, password, new RequestInfo(0, this, function(){

    }));
  }

  /*
   * Performs a login by first getting the security
   * record associated with the email and password,
   * then trying to find the account record associated
   * with the security record. Passes the API response
   * to the callback.
   * 
   * @param {string} email: Email to login to.
   * @param {string} password: Password used to login.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  login(email: string, password: string, requestInfo: RequestInfo) : void {
    this.loading = true;
    // Query API to login
    this.http.get(this.url + '/securities/' + email + '/' + password).subscribe((data: Config) => {
      // Login successful
      this.security = data.security;
      this.password = password;
      // User hasn't set personal information yet
      if(!this.security.account){
        // Let all the observers know that a login has occurred, but no
        // personal information has been set yet
        this.sendToObservers(data);
        requestInfo.respond(data);
        this.loading = false;
      }
      // User has already set personal information
      else{
        this.http.get(this.url + '/accounts', {
          headers: new HttpHeaders({
            'security_id': this.security._id,
            'hashPass': this.password
          })
        }).subscribe((data: Config) => {
          // Let all the observers know that a login has occurred
          this.sendToObservers({
            security: this.security,
            account: data.account
          });
          this.loggedIn = true;
          this.cookieService.set(this.emailCookieKey, email);
          this.cookieService.set(this.passwordCookieKey, password);
          requestInfo.respond({
            security: this.security,
            account: data.account
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

  /*
   * This function logs the user out.
   * 
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  logout(requestInfo: RequestInfo) : void {
    this.security = null;
    this.account = null;
    this.password = '';
    this.loggedIn = false;
    this.cookieService.set(this.emailCookieKey, '');
    this.cookieService.set(this.passwordCookieKey, '');
    // Let all the observers know that a logout has occurred
    this.sendToObservers(null);
    requestInfo.respond(null);
    this.router.navigate(['']);
  }

  /*
   * Creates a security record, passes the API
   * response to the callback.
   * 
   * @param {string} email: Email to register.
   * @param {string} password: Password of new account to
   * be registered.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  register(email: string, password: string, requestInfo: RequestInfo) : void {
    this.http.post(this.url + '/securities', {
      email: email,
      hashPass: password
    }).subscribe((data: Config) => {
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * This function is called when the user logs in for the
   * first time and fills in their personal information.
   * Their personal information is then sent to the API.
   * 
   * @param {string} firstName: First name of the user.
   * @param {string} lastName: Last name of the user.
   * @param {RequestInfo} requestInfo: Information regarding
   * the request.
   */
  postUserInfo(firstName: string, lastName: string, requestInfo: RequestInfo) : void {
    if(!firstName || !lastName){
      requestInfo.respond({
        error: 'firstName and lastName must be non-empty strings.'
      });
      return;
    }
    this.http.post(this.url + '/accounts', {
      firstName: firstName,
      lastName: lastName
    }, {
      headers: new HttpHeaders({
        'security_id': this.security._id,
        'hashPass': this.password
      })
    }).subscribe((data: Config) => {
      this.loggedIn = true;
      this.security.account = data.account._id;
      this.account = data.account;
      this.sendToObservers({
        security: this.security,
        account: this.account
      });
      this.router.navigate(['']);
      requestInfo.respond(data);
    }, error => {
      requestInfo.respond(error);
    });
  }

  /*
   * This function sends a message to all of the loginObservable's
   * observers.
   * 
   * @param {any} message: Message of any type to send to all
   * of the observers.
   */
  sendToObservers(message: any) : void {
    for(let i = 0; i < this.loginObservable.observers.length; i++){
      this.loginObservable.observers[i].next(message);
    }
  }
}

export class RequestInfo {
  public searchSeqNum: number;
  public self;
  public callback: Function;

  constructor(searchSeqNum: number, self: Object, callback: Function){
    this.searchSeqNum = searchSeqNum;
    this.self = self;
    this.callback = callback;
  }

  public respond(data) : void {
    this.callback(new RequestResponse(this, data));
  }
}

export class RequestResponse {
  public requestInfo: RequestInfo;
  public response;

  constructor(requestInfo: RequestInfo, response: any){
    this.requestInfo = requestInfo;
    this.response = response;
  }
}

export interface Model {
  _id: string;
}

export class Security implements Model {
  public _id: string;
  public account: string;
  public authentication: string;
  public email: string;
  public hashPass: string;
  public passChange: string;
  public salt: string;

  constructor(_id: string, account: string, authentication: string, email: string, hashPass: string, passChange: string, salt: string){
    this._id = _id;
    this.account = account;
    this.authentication = authentication;
    this.email = email;
    this.hashPass = hashPass;
    this.passChange = passChange;
    this.salt = salt;
  }
}

export class Account implements Model {
  public _id: string;
  public firstName: string;
  public lastName: string;
  public portfolios: Array<string>;
  public security: string;

  constructor(_id: string, firstName: string, lastName: string, portfolios: Array<string>, security: string){
    this._id = _id;
    this.firstName = firstName;
    this.lastName
  }
}