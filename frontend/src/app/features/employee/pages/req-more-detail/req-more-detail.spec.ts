import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqMoreDetail } from './req-more-detail';

describe('ReqMoreDetail', () => {
  let component: ReqMoreDetail;
  let fixture: ComponentFixture<ReqMoreDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReqMoreDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ReqMoreDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
