import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPortfolioModalComponent } from './post-portfolio-modal.component';

describe('PostPortfolioModalComponent', () => {
  let component: PostPortfolioModalComponent;
  let fixture: ComponentFixture<PostPortfolioModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostPortfolioModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPortfolioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
