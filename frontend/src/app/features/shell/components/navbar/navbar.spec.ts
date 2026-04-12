import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  async function setup(roles: string[], url: string = '/') {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole', 'getRoles']);
    mockAuthService.getRoles.and.returnValue(roles);
    mockAuthService.getRole.and.returnValue(roles.length > 0 ? roles[0] : null);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue(url);

    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup(['STOREKEEPER']);
    expect(component).toBeTruthy();
  });

  it('should display "Admin" when on /admin path', async () => {
    await setup(['ADMIN'], '/admin/overview');
    expect(component.roleName).toBe('Admin');
  });

  it('should display "Procurement" when on /procurement path', async () => {
    await setup(['PROCUREMENT'], '/procurement/purchase-orders');
    expect(component.roleName).toBe('Procurement');
  });

  it('should display "Dashboard" when on root path with no role', async () => {
    await setup([], '/overview');
    expect(component.roleName).toBe('Dashboard');
  });

  it('should render section name in the template', async () => {
    await setup(['AUDITOR'], '/reporting/reports');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.role-name')?.textContent?.trim()).toBe('Reporting');
  });
});
