import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePortfolioComponent } from './delete-portfolio.component';

describe('DeletePortfolioComponent', () => {
  let component: DeletePortfolioComponent;
  let fixture: ComponentFixture<DeletePortfolioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeletePortfolioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletePortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
