import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferReq } from './transfer-req';

describe('TransferReq', () => {
  let component: TransferReq;
  let fixture: ComponentFixture<TransferReq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferReq]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferReq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
