import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetPoolComponent } from './asset-pool';

describe('AssetPoolComponent', () => {
  let component: AssetPoolComponent;
  let fixture: ComponentFixture<AssetPoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetPoolComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetPoolComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
