import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformedArrivalsComponent } from './informed-arrivals';
import { ProcurementService } from '../../../procurement/services/procurement.service';
import { CheckoutService } from '../../services/checkout.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AssetInformingDto } from '../../../procurement/models/arrival.model';
import { CheckoutEmployee } from '../../models/checkout.model';

describe('InformedArrivalsComponent', () => {
  let component: InformedArrivalsComponent;
  let fixture: ComponentFixture<InformedArrivalsComponent>;
  let mockProcurementService: jasmine.SpyObj<ProcurementService>;
  let mockCheckoutService: jasmine.SpyObj<CheckoutService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockEmployees: CheckoutEmployee[] = [
    { id: '65', name: 'IT Employee', division: 'Information Technology', divisionId: 1, email: 'it@assura.com' },
    { id: '66', name: 'Industrial Employee', division: 'Industrial Services', divisionId: 2, email: 'ind@assura.com' },
    { id: '72', name: 'Finance Employee', division: 'Finance', divisionId: 8, email: 'fin@assura.com' }
  ];

  const mockArrivals: AssetInformingDto[] = [
    {
      id: 51,
      itemName: 'PO-20260815164454',
      model: 'Sony V720H',
      warranty: '1 Years',
      quantity: 1,
      purchasedDate: '2026-08-14T18:30:00.000Z',
      purchasedPrice: 52000,
      status: 'Pending',
      divisionId: 1,
      divisionName: 'Information Technology',
      createdAt: '2026-08-15T11:15:36.923Z'
    },
    {
      id: 49,
      itemName: 'PO-20260814022829',
      model: 'fjaeifjieafjief',
      warranty: '2 Years',
      quantity: 2,
      purchasedDate: '2026-08-12T18:30:00.000Z',
      purchasedPrice: 120000,
      status: 'Informed',
      divisionId: 2,
      divisionName: 'Industrial Services',
      createdAt: '2026-08-13T21:05:00.725Z'
    }
  ];

  beforeEach(async () => {
    mockProcurementService = jasmine.createSpyObj('ProcurementService', ['getAssetInformings', 'informStakeholders']);
    mockCheckoutService = jasmine.createSpyObj('CheckoutService', ['getEmployees']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockProcurementService.getAssetInformings.and.returnValue(of(mockArrivals));
    mockCheckoutService.getEmployees.and.returnValue(of(mockEmployees));

    await TestBed.configureTestingModule({
      imports: [InformedArrivalsComponent],
      providers: [
        { provide: ProcurementService, useValue: mockProcurementService },
        { provide: CheckoutService, useValue: mockCheckoutService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InformedArrivalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and load initial data', () => {
    expect(component).toBeTruthy();
    expect(component.arrivals.length).toBe(2);
    expect(component.employees.length).toBe(3);
  });

  it('should auto-fill target employee by divisionId when openInformModal is called', () => {
    component.openInformModal(mockArrivals[0]);

    expect(component.showInformModal).toBe(true);
    expect(component.selectedArrival).toEqual(mockArrivals[0]);
    expect(component.selectedEmployeeId).toBe('65'); // IT Employee (divisionId: 1)
  });

  it('should auto-fill target employee by divisionName fallback if divisionId is absent', () => {
    const arrivalWithoutDivId = {
      id: 52,
      itemName: 'Laptop',
      quantity: 1,
      purchasedDate: '2026-08-14',
      purchasedPrice: 50000,
      status: 'Pending',
      divisionId: 0,
      divisionName: 'Finance',
      createdAt: '2026-08-15'
    } as AssetInformingDto;

    component.openInformModal(arrivalWithoutDivId);

    expect(component.selectedEmployeeId).toBe('72'); // Finance Employee (division: 'Finance')
  });

  it('should auto-fill employee when employees load asynchronously while modal is open', () => {
    component.selectedArrival = mockArrivals[0];
    component.showInformModal = true;
    component.selectedEmployeeId = '';
    component.employees = [];

    // Trigger loadEmployees
    component.loadEmployees();

    expect(component.selectedEmployeeId).toBe('65');
  });
});
