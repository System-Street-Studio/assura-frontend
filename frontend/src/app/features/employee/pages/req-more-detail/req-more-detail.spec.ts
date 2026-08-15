import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ReqMoreDetail } from './req-more-detail';
import { AssetService } from '../../services/asset-request.service';

describe('ReqMoreDetail', () => {
  let component: ReqMoreDetail;
  let fixture: ComponentFixture<ReqMoreDetail>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;

  function configure(idParam: string | null) {
    return TestBed.configureTestingModule({
      imports: [ReqMoreDetail],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(idParam ? { id: idParam } : {}) } }
        }
      ]
    }).compileComponents();
  }

  beforeEach(() => {
    assetServiceSpy = jasmine.createSpyObj('AssetService', ['getRequestById']);
  });

  it('should create', async () => {
    await configure(null);
    fixture = TestBed.createComponent(ReqMoreDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  // Covers the BUGS.md finding: the request-details page only read data from router
  // navigation state, so a page refresh or direct link showed "No request data
  // available" even though the backend could serve the record by id.
  it('should fetch the request by route id when navigation state is unavailable', async () => {
    assetServiceSpy.getRequestById.and.returnValue(of({ id: 55, status: 'Pending' } as any));
    await configure('55');

    fixture = TestBed.createComponent(ReqMoreDetail);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(assetServiceSpy.getRequestById).toHaveBeenCalledWith(55);
    expect(component.request()?.id).toBe(55);
    expect(component.error()).toBeNull();
  });

  it('should show an error if the fallback fetch fails', async () => {
    assetServiceSpy.getRequestById.and.returnValue(throwError(() => new Error('not found')));
    await configure('55');

    fixture = TestBed.createComponent(ReqMoreDetail);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.request()).toBeNull();
    expect(component.error()).toBeTruthy();
  });

  it('should show an error when there is no navigation state and no route id', async () => {
    await configure(null);

    fixture = TestBed.createComponent(ReqMoreDetail);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(assetServiceSpy.getRequestById).not.toHaveBeenCalled();
    expect(component.error()).toBeTruthy();
  });
});
