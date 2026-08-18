import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DivisionAssetsComponent } from './division-assets';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { DivisionHeadDashboardService } from '../../services/division-head-dashboard.service';

describe('DivisionAssetsComponent', () => {
  let component: DivisionAssetsComponent;
  let fixture: ComponentFixture<DivisionAssetsComponent>;
  let mockAssetService: jasmine.SpyObj<AssetService>;
  let mockDashboardService: jasmine.SpyObj<DivisionHeadDashboardService>;

  beforeEach(async () => {
    mockAssetService = jasmine.createSpyObj('AssetService', ['getAll']);
    mockAssetService.getAll.and.returnValue(of([]));

    mockDashboardService = jasmine.createSpyObj('DivisionHeadDashboardService', ['updateAssetCount']);

    await TestBed.configureTestingModule({
      imports: [DivisionAssetsComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: mockAssetService },
        { provide: DivisionHeadDashboardService, useValue: mockDashboardService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
