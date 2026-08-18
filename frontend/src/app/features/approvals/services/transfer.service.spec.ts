import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HeadTransferService } from './transfer.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

describe('HeadTransferService', () => {
  let service: HeadTransferService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
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
