import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { PortfoliosComponent } from './pages/portfolios/portfolios.component';
import { SetUserModalComponent } from './components/set-user-modal/set-user-modal.component';
import { PostPortfolioModalComponent } from './components/post-portfolio-modal/post-portfolio-modal.component';
import { ViewPortfolioComponent } from './pages/view-portfolio/view-portfolio.component';
import { BrowseMarketComponent } from './pages/browse-market/browse-market.component';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner/loading-spinner.component';
import { BuyStockModalComponent } from './components/buy-stock-modal/buy-stock-modal.component';
import { SellStockModalComponent } from './components/sell-stock-modal/sell-stock-modal.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    HomeComponent,
    PortfoliosComponent,
    SetUserModalComponent,
    PostPortfolioModalComponent,
    ViewPortfolioComponent,
    BrowseMarketComponent,
    LoadingSpinnerComponent,
    BuyStockModalComponent,
    SellStockModalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgbModule.forRoot(),
    ChartsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent},
      { path: 'login', component: LoginComponent },
      { path: 'portfolios', component: PortfoliosComponent },
      { path: 'browseMarket', component: BrowseMarketComponent },
      { path: 'viewPortfolio', component: ViewPortfolioComponent}
    ])
  ],
  exports: [
    NavbarComponent
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
