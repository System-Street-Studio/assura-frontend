import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportingDashboardComponent } from './dashboard';
import { ReportingService } from '../services/reporting.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { throwError, of } from 'rxjs';

describe('ReportingDashboardComponent - error handling', () => {
  let component: ReportingDashboardComponent;
  let fixture: ComponentFixture<ReportingDashboardComponent>;
  let mockReportingService: any;
  let mockToastService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockReportingService = {
      getDashboard: jasmine.createSpy('getDashboard').and.returnValue(throwError(() => new Error('network error')))
    };

    mockToastService = {
      error: jasmine.createSpy('error')
    };

    mockAuthService = {
      getFirstName: jasmine.createSpy('getFirstName').and.returnValue('Alex')
    };

    await TestBed.configureTestingModule({
      imports: [ReportingDashboardComponent],
      providers: [
        { provide: ReportingService, useValue: mockReportingService },
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should notify the user via ToastService when the dashboard fails to load', () => {
    fixture = TestBed.createComponent(ReportingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockReportingService.getDashboard).toHaveBeenCalled();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should populate signals when the dashboard loads successfully', () => {
    mockReportingService.getDashboard.and.returnValue(of({
      metrics: [{ label: 'Total', value: '5' }],
      categoryLegend: [],
      statusBars: [],
      divisionBars: [],
      valueBars: [],
      anomalies: { ghostAssetsDetected: 0, missingPhysicalVerification: 0 }
    }));

    fixture = TestBed.createComponent(ReportingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.metrics().length).toBe(1);
    expect(mockToastService.error).not.toHaveBeenCalled();
  });

  it('should use the logged-in user\'s first name instead of a hardcoded placeholder', () => {
    fixture = TestBed.createComponent(ReportingDashboardComponent);
    component = fixture.componentInstance;

    expect(component.firstName).toBe('Alex');
  });

  it('should fall back to a placeholder when no first name is available', () => {
    mockAuthService.getFirstName.and.returnValue(null);

    fixture = TestBed.createComponent(ReportingDashboardComponent);
    component = fixture.componentInstance;

    expect(component.firstName).toBe('Reporter');
  });
});
