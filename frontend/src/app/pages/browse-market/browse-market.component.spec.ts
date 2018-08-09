import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseMarketComponent } from './browse-market.component';

describe('BrowseMarketComponent', () => {
  let component: BrowseMarketComponent;
  let fixture: ComponentFixture<BrowseMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
