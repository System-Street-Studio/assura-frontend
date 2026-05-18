import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssetRequestComponent } from './new-asset-request';

describe('NewAssetRequestComponent', () => {
  let component: NewAssetRequestComponent;
  let fixture: ComponentFixture<NewAssetRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAssetRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssetRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
