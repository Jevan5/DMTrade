import { Component, OnInit } from '@angular/core';
import { Config } from 'protractor';
import { LoginService, RequestInfo, RequestResponse } from '../../services/login/login.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-set-user-modal',
  templateUrl: './set-user-modal.component.html',
  styleUrls: ['./set-user-modal.component.css']
})
export class SetUserModalComponent {
  model = {
    firstName: "",
    lastName: ""
  }

  @ViewChild('content') private content;

  constructor(private loginService: LoginService, private modalService: NgbModal,
    private router: Router) {
    this.loginService.loginObservable.subscribe((data: Config) => {
      // User has not set their personal information yet
      if(data && !data.security.account){
        this.open(this.content);
      }
    });
  }

  /*
   * Displays the modal to set the user's personal information.
   * 
   * @param {Object} content: Content to fill the modal.
   */
  open(content){
    this.modalService.open(content, { centered: true }).result.then((result) => {
      // User pressed save but did not provide the required information
      if(!this.model.firstName || !this.model.lastName){
        alert('Please fill out your user information after logging in.');
        this.router.navigate(['']);
        return;
      }
      // Call the loginService to set the user's personal information
      // by creating an account
      this.loginService.postUserInfo(this.model.firstName, this.model.lastName, new RequestInfo(0, self, this.openCallback));
    }, (reason) => {
      // User closed the modal prematurely
      alert('Please fill out your user information after logging in.');
      this.router.navigate(['/login']);
    });
  }

  /*
   * This function is called when the LoginService has tried to create
   * the account for the user.
   * 
   * @param {RequestResponse} requestResponse: Response from the
   * LoginService after posting the new user's info.
   */
  openCallback(requestResponse: RequestResponse) : void {
    if(requestResponse.response.error){
      alert('Error setting user info: ' + requestResponse.response.error);
    }
    else{
      alert('User info set!');
    }
  }

}
