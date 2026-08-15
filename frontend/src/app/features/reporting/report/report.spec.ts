import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportingReportComponent } from './report';
import { ReportingService } from '../services/reporting.service';
import { ToastService } from '../../../shared/services/toast.service';
import { throwError, of } from 'rxjs';

describe('ReportingReportComponent - error handling', () => {
  let component: ReportingReportComponent;
  let fixture: ComponentFixture<ReportingReportComponent>;
  let mockReportingService: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockReportingService = {
      getReports: jasmine.createSpy('getReports').and.returnValue(throwError(() => new Error('network error'))),
      markReportCompleted: jasmine.createSpy('markReportCompleted').and.returnValue(of(true))
    };

    mockToastService = {
      error: jasmine.createSpy('error'),
      success: jasmine.createSpy('success')
    };

    await TestBed.configureTestingModule({
      imports: [ReportingReportComponent],
      providers: [
        { provide: ReportingService, useValue: mockReportingService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();
  });

  it('should notify the user via ToastService when reports fail to load', () => {
    fixture = TestBed.createComponent(ReportingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockReportingService.getReports).toHaveBeenCalled();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should populate signals when reports load successfully', () => {
    mockReportingService.getReports.and.returnValue(of({
      summaries: [],
      reportItems: [{ id: 'RPT-1', title: 'Test' }],
      insights: []
    }));

    fixture = TestBed.createComponent(ReportingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.reportItems().length).toBe(1);
    expect(mockToastService.error).not.toHaveBeenCalled();
  });

  it('should call markReportCompleted and reload on success', () => {
    mockReportingService.getReports.and.returnValue(of({ summaries: [], reportItems: [], insights: [] }));

    fixture = TestBed.createComponent(ReportingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.markCompleted({ id: 'RPT-202608-C001', status: 'Pending', owner: '1' });

    expect(mockReportingService.markReportCompleted).toHaveBeenCalledWith('RPT-202608-C001');
    expect(mockToastService.success).toHaveBeenCalled();
    expect(mockReportingService.getReports).toHaveBeenCalledTimes(2);
  });

  it('should notify via toast when markReportCompleted fails', () => {
    mockReportingService.getReports.and.returnValue(of({ summaries: [], reportItems: [], insights: [] }));
    mockReportingService.markReportCompleted.and.returnValue(throwError(() => new Error('not found')));

    fixture = TestBed.createComponent(ReportingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.markCompleted({ id: 'RPT-202608-C001', status: 'Pending', owner: '1' });

    expect(mockToastService.error).toHaveBeenCalled();
  });
});
