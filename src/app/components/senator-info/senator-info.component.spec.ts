import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SenatorInfoComponent } from './senator-info.component';

describe('SenatorInfoComponent', () => {
  let component: SenatorInfoComponent;
  let fixture: ComponentFixture<SenatorInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SenatorInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SenatorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
