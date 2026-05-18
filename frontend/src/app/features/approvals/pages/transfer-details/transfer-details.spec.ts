import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferDetailsComponent } from './transfer-details';

describe('TransferReq', () => {
  let component: TransferDetailsComponent;
  let fixture: ComponentFixture<TransferDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
