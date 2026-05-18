import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DivisionAssetsComponent } from './division-assets';

describe('DivisionAssetsComponent', () => {
  let component: DivisionAssetsComponent;
  let fixture: ComponentFixture<DivisionAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivisionAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionAssetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
