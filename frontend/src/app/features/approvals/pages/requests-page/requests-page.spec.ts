import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RequestsPageComponent } from './requests-page';
import { RequestService } from '../../services/requests.service';
import { CategoryService } from '../../../inventory/services/category.service';

describe('RequestsPageComponent', () => {
  let component: RequestsPageComponent;
  let fixture: ComponentFixture<RequestsPageComponent>;
  let mockRequestService: jasmine.SpyObj<RequestService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;

  beforeEach(async () => {
    mockRequestService = jasmine.createSpyObj('RequestService', ['getAllRequests']);
    mockRequestService.getAllRequests.and.returnValue(of([]));

    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getAll']);
    mockCategoryService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RequestsPageComponent],
      providers: [
        provideRouter([]),
        { provide: RequestService, useValue: mockRequestService },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
