import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from 'protractor';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loggedIn = false; // Keeps track of if a user is logged in or not
  loginObservable;  // Emits null if logging out, { service, account } if logging in
  password = '';    // Keeps track of the password entered upon a successful login
  security;         // Keeps track of the logged in user's security record
  account;          // Keeps track of the logged in user's account record
  url = 'http://127.0.0.1:8080';

  constructor(private http: HttpClient, private router: Router) {
    this.loginObservable = new Observable((observer) => {
      this.loginObservable.observers.push(observer);

      return {
        unsubscribe(){
          
        }
      }
    });

    this.loginObservable.observers = [];
  }

  // Performs a login by first getting the security
  // record associated with the email and password,
  // then trying to find the account record associated
  // with the security record. Passes the API response
  // to the callback
  login(email, password, self, callback){
    // Query API to login
    this.http.get(this.url + '/securities/' + email + '/' + password).subscribe((data: Config) => {
      // Login successful
      this.security = data.security;
      this.password = password;
      // User hasn't set personal information yet
      if(!this.security.account){
        // Let all the observers know that a login has occurred, but no
        // personal information has been set yet
        for(let i = 0; i < this.loginObservable.observers.length; i++){
          this.loginObservable.observers[i].next(data);
        }
        callback(self, data);
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
          for(let i = 0; i < this.loginObservable.observers.length; i++){
            this.loginObservable.observers[i].next({
              security: this.security,
              account: data.account
            });
          }
          this.loggedIn = true;
          callback(self, {
            security: this.security,
            account: data.account
          });
        }, error => {
          callback(self, error);
        })
      }
    }, error => {
      callback(self, error);
    });
  }

  // Logs the user out
  logout(self, callback){
    this.security = null;
    this.account = null;
    this.password = '';
    this.loggedIn = false;
    // Let all the observers know that a logout has occurred
    for(var i = 0; i < this.loginObservable.observers.length; i++){
      this.loginObservable.observers[i].next();
    }
    callback(self, null);
    this.router.navigate(['']);
  }

  // Creates a security record, passes the API
  // response to the callback
  register(email, password, self, callback){
    this.http.post(this.url + '/securities', {
      email: email,
      hashPass: password
    }).subscribe((data: Config) => {
      callback(self, data.message);
    }, error => {
      callback(self, error);
    });
  }

  postUserInfo(firstName, lastName, self, callback){
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
      for(let i = 0; i < this.loginObservable.observers.length; i++){
        this.loginObservable.observers[i].next({
          security: this.security,
          account: this.account
        });
      }
      this.router.navigate(['']);
    }, error => {
      callback(self, error);
    });
  }
}