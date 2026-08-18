import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotifService: jasmine.SpyObj<NotificationService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  async function setup(roles: string[], url = '/') {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole', 'getRoles', 'logout']);
    mockAuthService.getRoles.and.returnValue(roles);
    mockAuthService.getRole.and.returnValue(roles.length > 0 ? roles[0] : null);

    mockNotifService = jasmine.createSpyObj('NotificationService', ['getAll', 'getUnreadCount', 'markAsRead', 'markAllAsRead', 'formatTimeAgo']);
    mockNotifService.getAll.and.returnValue(of([]));
    mockNotifService.getUnreadCount.and.returnValue(of(0));

    mockProfileService = jasmine.createSpyObj('ProfileService', ['getProfile', 'clearCache'], {
      profile: signal({ firstName: 'Test', lastName: 'User', username: 'testuser', email: 'test@example.com', roles: [] })
    });
    mockProfileService.getProfile.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotifService },
        { provide: ProfileService, useValue: mockProfileService },
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
    expect(compiled.querySelector('.profile-role')?.textContent?.trim()).toBe('Reporting');
  });
});
