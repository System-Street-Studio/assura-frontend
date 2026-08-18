import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TransferPageComponent } from './transfer-page';
import { EmployeeTransferService } from '../../services/asset-transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('Employee TransferPageComponent', () => {
  let component: TransferPageComponent;
  let fixture: ComponentFixture<TransferPageComponent>;
  let mockTransferService: jasmine.SpyObj<EmployeeTransferService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockTransferService = jasmine.createSpyObj('EmployeeTransferService', [
      'getTransfers',
      'getTransferCounts',
      'acceptTransfer',
      'rejectTransfer',
      'returnActiveTransfer'
    ]);
    mockTransferService.getTransfers.and.returnValue(of([]));
    mockTransferService.getTransferCounts.and.returnValue(of({
      incomingCount: 0,
      pendingCount: 0,
      activeCount: 0,
      completedCount: 0
    }));

    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);
    mockAuthService.getUserId.and.returnValue('1');

    await TestBed.configureTestingModule({
      imports: [TransferPageComponent],
      providers: [
        { provide: EmployeeTransferService, useValue: mockTransferService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
