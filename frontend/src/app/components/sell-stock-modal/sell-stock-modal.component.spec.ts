import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellStockModalComponent } from './sell-stock-modal.component';

describe('SellStockModalComponent', () => {
  let component: SellStockModalComponent;
  let fixture: ComponentFixture<SellStockModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellStockModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
