import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUserModalComponent } from './set-user-modal.component';

describe('SetUserModalComponent', () => {
  let component: SetUserModalComponent;
  let fixture: ComponentFixture<SetUserModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetUserModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
