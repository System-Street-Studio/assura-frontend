import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardDetailsComponent } from './discard-details';

describe('DiscardDetails', () => {
  let component: DiscardDetailsComponent;
  let fixture: ComponentFixture<DiscardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscardDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
