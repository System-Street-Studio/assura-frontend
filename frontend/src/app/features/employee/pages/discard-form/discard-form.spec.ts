import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardFormComponent } from './discard-form';

describe('DiscardFormComponent', () => {
  let component: DiscardFormComponent;
  let fixture: ComponentFixture<DiscardFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscardFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
