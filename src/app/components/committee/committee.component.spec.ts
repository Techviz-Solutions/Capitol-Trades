import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommitteeComponent } from './committee.component';

describe('CommitteeComponent', () => {
  let component: CommitteeComponent;
  let fixture: ComponentFixture<CommitteeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitteeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
