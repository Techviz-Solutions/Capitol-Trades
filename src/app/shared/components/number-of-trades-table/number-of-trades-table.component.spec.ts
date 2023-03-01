import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumberOfTradesTableComponent } from './number-of-trades-table.component';

describe('NumberOfTradesTableComponent', () => {
  let component: NumberOfTradesTableComponent;
  let fixture: ComponentFixture<NumberOfTradesTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberOfTradesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberOfTradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
