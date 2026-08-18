import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TransferPageComponent } from './transfer-page';
import { HeadTransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('TransferPage', () => {
  let component: TransferPageComponent;
  let fixture: ComponentFixture<TransferPageComponent>;
  let mockTransferService: jasmine.SpyObj<HeadTransferService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockTransferService = jasmine.createSpyObj('HeadTransferService', [
      'getTransferCounts',
      'getDivisionHeadTransfers'
    ]);
    mockTransferService.getTransferCounts.and.returnValue(of({
      outgoingCount: 0,
      incomingCount: 0,
      pendingCount: 0,
      activeCount: 0,
      completedCount: 0
    }));
    mockTransferService.getDivisionHeadTransfers.and.returnValue(of([]));

    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId', 'getDivisionId']);
    mockAuthService.getUserId.and.returnValue('1');
    mockAuthService.getDivisionId.and.returnValue(1);

    await TestBed.configureTestingModule({
      imports: [TransferPageComponent],
      providers: [
        { provide: HeadTransferService, useValue: mockTransferService },
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
