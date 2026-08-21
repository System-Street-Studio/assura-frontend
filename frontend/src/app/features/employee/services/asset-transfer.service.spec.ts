import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeTransferService } from './asset-transfer.service';
import { environment } from '../../../../environments/environment';

describe('EmployeeTransferService', () => {
  let service: EmployeeTransferService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EmployeeTransferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // Covers the BUGS.md finding: getTransferCounts() sent a dead ?userId= query param
  // the backend ignores (it always derives the caller from the JWT). The method no
  // longer takes or sends a userId at all.
  it('getTransferCounts should GET the counts endpoint with no query params', () => {
    service.getTransferCounts().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/transfers/counts`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({});
  });
});
