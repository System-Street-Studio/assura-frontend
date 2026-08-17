import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HeadTransferService } from './transfer.service';
import { environment } from '../../../../environments/environment';

// Covers the newly-found bug: the Division Head "Reject" button on the main
// Transfer list called rejectByHead(), but that method POSTed to
// /transfers/{id}/reject — the asset-holder reject endpoint, which requires
// CurrentHolderId === callerId and a Division Head is never the holder, so this
// always 403'd. The correct, division-scoped endpoint is /transfers/{id}/reject-head.
describe('HeadTransferService', () => {
  let service: HeadTransferService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HeadTransferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('rejectByHead should POST to the reject-head endpoint, not reject', () => {
    service.rejectByHead(42, 'not needed').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/transfers/42/reject-head`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'not needed' });
    req.flush({});
  });
});
