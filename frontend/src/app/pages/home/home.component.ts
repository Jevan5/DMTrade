import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private loginService: LoginService, private router: Router) {
  }

  /**
   * This function is called when the user clicks the Get Started
   * button.
   */
  getStartedClick(){
    this.router.navigate(['/login']);
  }

}
