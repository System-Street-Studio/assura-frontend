import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferPageComponent } from './transfer-page';

describe('TransferPage', () => {
  let component: TransferPageComponent;
  let fixture: ComponentFixture<TransferPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
