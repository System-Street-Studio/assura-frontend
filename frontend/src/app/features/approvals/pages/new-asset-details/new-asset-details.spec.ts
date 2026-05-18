import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssetDetailsComponent } from './new-asset-details';

describe('NewAssetDetails', () => {
  let component: NewAssetDetailsComponent;
  let fixture: ComponentFixture<NewAssetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAssetDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssetDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
