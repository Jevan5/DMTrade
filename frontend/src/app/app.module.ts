import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { PortfoliosComponent } from './pages/portfolios/portfolios.component';
import { SetUserModalComponent } from './components/set-user-modal/set-user-modal.component';
import { PostPortfolioModalComponent } from './components/post-portfolio-modal/post-portfolio-modal.component';
import { DeletePortfolioComponent } from './components/delete-portfolio/delete-portfolio.component';
import { ListPortfolioComponent } from './components/list-portfolio/list-portfolio.component';
import { ViewPortfolioComponent } from './pages/view-portfolio/view-portfolio.component';
import { BrowseMarketComponent } from './pages/browse-market/browse-market.component';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    HomeComponent,
    PortfoliosComponent,
    SetUserModalComponent,
    PostPortfolioModalComponent,
    DeletePortfolioComponent,
    ListPortfolioComponent,
    ViewPortfolioComponent,
    BrowseMarketComponent,
    LoadingSpinnerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgbModule.forRoot(),
    RouterModule.forRoot([
      { path: '', component: HomeComponent},
      { path: 'login', component: LoginComponent },
      { path: 'portfolios', component: PortfoliosComponent },
      { path: 'viewPortfolio', component: ViewPortfolioComponent },
      { path: 'browseMarket', component: BrowseMarketComponent }
    ])
  ],
  exports: [
    NavbarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
