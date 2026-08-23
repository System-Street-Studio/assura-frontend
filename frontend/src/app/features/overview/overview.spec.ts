import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OverviewComponent } from './overview';
import { QueueItemsService, QueueItem } from '../../services/queue-items.service';
import { BuyersService, Buyer } from '../../services/buyers.service';
import { AuthService } from '../../core/auth/auth.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let queueItemsServiceSpy: jasmine.SpyObj<QueueItemsService>;

  let pendingItem: QueueItem;
  let buyer: Buyer;

  beforeEach(async () => {
    // Fresh object every test — submitReview() mutates selectedItem.status in place,
    // so reusing a single shared object would leak state across tests.
    pendingItem = {
      id: '1',
      name: 'Old Printer',
      division: 'IT',
      date: '2026-08-16',
      status: 'Pending',
      time: '10:00',
      assetType: 'Hardware',
      specialNote: 'Requested for disposal'
    };

    buyer = { id: '5', name: 'Acme Recyclers', contact: 'Jane', email: 'jane@acme.test', phone: '0123456789', category: 'Scrap', status: 'Active' };

    queueItemsServiceSpy = jasmine.createSpyObj('QueueItemsService', ['getAll', 'updateStatus']);
    queueItemsServiceSpy.getAll.and.returnValue(of([pendingItem]));
    queueItemsServiceSpy.updateStatus.and.returnValue(of(void 0));

    const buyersServiceSpy = jasmine.createSpyObj('BuyersService', ['getAll']);
    buyersServiceSpy.getAll.and.returnValue(of([buyer]));

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        { provide: QueueItemsService, useValue: queueItemsServiceSpy },
        { provide: BuyersService, useValue: buyersServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Covers the bug reported directly by a user: clicking "Confirm Approval" on a
  // pending discard did nothing, with no visible error. Root cause: the button had
  // [disabled]="reviewNoteControl.invalid", and a disabled HTML button never fires a
  // click event at all — so submitReview()'s own guard (mark the control touched, show
  // the inline "note is required" error, then return) was unreachable dead code. This
  // drives the actual rendered button, not the component method directly, so it fails
  // before the fix (disabled button swallows the click; nothing happens, control never
  // gets touched, no error renders) and passes after (button is clickable, guard runs,
  // error becomes visible).
  it('clicking Confirm Approval with an empty note should surface the inline error, not silently do nothing', async () => {
    const el: HTMLElement = fixture.debugElement.nativeElement;
    el.querySelector<HTMLButtonElement>('.review-section .assura-btn-primary')!.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('.review-choose-btns .approve')!.click();
    await fixture.whenStable();

    const submitBtn = el.querySelector<HTMLButtonElement>('.review-notes .submit-btn');
    expect(submitBtn).withContext('Confirm Approval button should be rendered').toBeTruthy();

    submitBtn!.click();
    await fixture.whenStable();

    expect(queueItemsServiceSpy.updateStatus).not.toHaveBeenCalled();
    expect(component.reviewNoteControl.touched)
      .withContext('a real click must reach submitReview() so its guard can mark the control touched and reveal the error')
      .toBeTrue();

    const errorEl = el.querySelector('.field-error');
    expect(errorEl).withContext('the inline "note is required" error should now be visible').toBeTruthy();
  });

  it('clicking Confirm Approval with a valid note but no buyer should surface the buyer-required error', async () => {
    const el: HTMLElement = fixture.debugElement.nativeElement;
    el.querySelector<HTMLButtonElement>('.review-section .assura-btn-primary')!.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('.review-choose-btns .approve')!.click();
    await fixture.whenStable();

    component.reviewNoteControl.setValue('Verified and disposed');
    await fixture.whenStable();

    const submitBtn = el.querySelector<HTMLButtonElement>('.review-notes .submit-btn');
    submitBtn!.click();
    await fixture.whenStable();

    expect(queueItemsServiceSpy.updateStatus).not.toHaveBeenCalled();
    expect(component.buyerIdControl.touched).toBeTrue();
  });

  it('clicking Confirm Approval with a valid note, buyer, and sold price should call the backend and complete the review', async () => {
    const el: HTMLElement = fixture.debugElement.nativeElement;
    el.querySelector<HTMLButtonElement>('.review-section .assura-btn-primary')!.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('.review-choose-btns .approve')!.click();
    await fixture.whenStable();

    component.reviewNoteControl.setValue('Verified and disposed');
    component.buyerIdControl.setValue(5);
    component.soldPriceControl.setValue(150);
    await fixture.whenStable();

    const submitBtn = el.querySelector<HTMLButtonElement>('.review-notes .submit-btn');
    submitBtn!.click();
    await fixture.whenStable();

    expect(queueItemsServiceSpy.updateStatus).toHaveBeenCalledWith('1', 'Approved', 'Verified and disposed', 5, 150);
    expect(component.reviewStep).toBe('idle');
  });
});
