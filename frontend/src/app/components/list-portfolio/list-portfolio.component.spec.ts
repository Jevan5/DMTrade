import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPortfolioComponent } from './list-portfolio.component';

describe('ListPortfolioComponent', () => {
  let component: ListPortfolioComponent;
  let fixture: ComponentFixture<ListPortfolioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPortfolioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
