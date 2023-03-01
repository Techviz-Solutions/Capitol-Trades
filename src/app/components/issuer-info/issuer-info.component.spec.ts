import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IssuerInfoComponent } from './issuer-info.component';

describe('IssuerInfoComponent', () => {
  let component: IssuerInfoComponent;
  let fixture: ComponentFixture<IssuerInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuerInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
