import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssetReqComponent } from './new-asset-req';

describe('NewAssetReqComponent', () => {
  let component: NewAssetReqComponent;
  let fixture: ComponentFixture<NewAssetReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAssetReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssetReqComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
