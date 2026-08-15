import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewArrivalsComponent } from './new-arrivals.component';
import { ProcurementService } from '../../services/procurement.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { of } from 'rxjs';

describe('NewArrivalsComponent', () => {
  let component: NewArrivalsComponent;
  let fixture: ComponentFixture<NewArrivalsComponent>;
  let mockProcurementService: jasmine.SpyObj<ProcurementService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockDivisions = [
    { id: 1, name: 'IT Division' },
    { id: 2, name: 'Finance Division' }
  ];

  const mockOrders = [
    {
      id: 101,
      orderNumber: 'PO-001',
      issuedDate: '2026-08-15',
      divisionId: 1,
      divisionName: 'IT Division',
      supplierName: 'Tech Supplier'
    },
    {
      id: 102,
      orderNumber: 'PO-002',
      issuedDate: '2026-08-14',
      divisionName: 'Finance Division',
      supplierName: 'Office World'
    }
  ];

  const mockOrderDetails = {
    id: 101,
    orderNumber: 'PO-001',
    orderDate: '2026-08-15',
    totalAmount: 50000,
    supplierName: 'Tech Supplier',
    divisionId: 1,
    divisionName: 'IT Division',
    items: [
      {
        id: 1,
        itemName: 'Dell Latitude Laptop',
        model: 'Latitude 5520',
        warranty: '3 Years',
        quantity: 5,
        unitPrice: 10000,
        amount: 50000,
        discount: 0,
        discountedPrice: 50000,
        vatPercentage: 0,
        vatAmount: 0,
        totalPrice: 50000
      }
    ]
  };

  beforeEach(async () => {
    mockProcurementService = jasmine.createSpyObj('ProcurementService', [
      'getDivisions',
      'getOrders',
      'getOrderById',
      'getAssetInformings',
      'informStores'
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);

    mockProcurementService.getDivisions.and.returnValue(of(mockDivisions));
    mockProcurementService.getOrders.and.returnValue(of(mockOrders as any));
    mockProcurementService.getOrderById.and.returnValue(of(mockOrderDetails as any));
    mockProcurementService.getAssetInformings.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [NewArrivalsComponent],
      providers: [
        { provide: ProcurementService, useValue: mockProcurementService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewArrivalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and load initial data', () => {
    expect(component).toBeTruthy();
    expect(component.divisions.length).toBe(2);
    expect(component.purchasingOrders.length).toBe(2);
  });

  it('should auto-fill divisionId, model, quantity, price and warranty when PO is selected by divisionId', () => {
    component.arrivalForm.patchValue({ purchasingOrderId: 101 });

    expect(component.arrivalForm.get('divisionId')?.value).toBe(1);
    expect(component.arrivalForm.get('model')?.value).toBe('Latitude 5520');
    expect(component.arrivalForm.get('quantity')?.value).toBe(5);
    expect(component.arrivalForm.get('purchasedPrice')?.value).toBe(10000);
    expect(component.arrivalForm.get('warranty')?.value).toBe(3);
    expect(component.arrivalForm.get('isYears')?.value).toBe(true);
  });

  it('should auto-fill divisionId when PO has divisionName fallback', () => {
    mockProcurementService.getOrderById.and.returnValue(of({
      id: 102,
      orderNumber: 'PO-002',
      orderDate: '2026-08-14',
      totalAmount: 1000,
      supplierName: 'Office World',
      divisionName: 'Finance Division',
      items: []
    } as any));

    component.arrivalForm.patchValue({ purchasingOrderId: 102 });

    expect(component.arrivalForm.get('divisionId')?.value).toBe(2);
  });

  it('should reset fields when purchasingOrderId is cleared', () => {
    component.arrivalForm.patchValue({ purchasingOrderId: 101 });
    expect(component.arrivalForm.get('divisionId')?.value).toBe(1);

    component.arrivalForm.patchValue({ purchasingOrderId: null });
    expect(component.arrivalForm.get('divisionId')?.value).toBeNull();
    expect(component.arrivalForm.get('model')?.value).toBe('');
  });
});
