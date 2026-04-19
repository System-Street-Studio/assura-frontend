import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  // setup now takes a string[] and a url string
  function setup(roles: string[], url: string = '/') {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole', 'getRoles', 'hasRole']);
    mockAuthService.getRoles.and.returnValue(roles);
    mockAuthService.getRole.and.returnValue(roles.length > 0 ? roles[0] : null);

    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue(url);

    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup(['Admin']);
    expect(component).toBeTruthy();
  });

  it('should show Admin items when on /admin path', async () => {
    await setup(['Admin'], '/admin/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Track Assets');
    expect(labels).not.toContain('PO'); // Procurement item
  });

  it('should show Procurement items when on /procurement path', async () => {
    await setup(['Procurement'], '/procurement/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('PO');
    expect(labels).toContain('Suppliers');
    expect(labels).not.toContain('Track Assets'); // Admin item
  });

  it('should show Procurement items for ADMIN on /procurement path', async () => {
    await setup(['Admin'], '/procurement/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('PO');
    expect(labels).not.toContain('Track Assets');
  });

  it('should show Employee items when on /employee path', async () => {
    await setup(['Employee'], '/employee/employee-overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Assets');
    expect(labels).toContain('Asset Request');
    expect(labels).toContain('Activity');
    expect(labels).not.toContain('PO'); // Procurement item
    expect(labels).not.toContain('Track Assets'); // Admin item
  });

  it('should show general items when on root path', async () => {
    await setup(['Admin'], '/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    // Note: Global Overview was mentioned in original test but I don't see it in menuItems.
    // I saw Dashboard icon home for admin.
    // Let's check what filteredMenuItems returns for root path.
    // If on /overview, no section matches. filtered will be all items for that role.
    expect(labels).toContain('Dashboard'); // Admin item should be visible if no section filter
  });

  it('should toggle isCollapsed when toggleMenu is called', async () => {
    await setup(['Admin']);
    expect(component.isCollapsed).toBeFalse();
    component.toggleMenu();
    expect(component.isCollapsed).toBeTrue();
    component.toggleMenu();
    expect(component.isCollapsed).toBeFalse();
  });

  it('should show global employee features regardless of path', async () => {
    // When on Admin path, should see Admin items AND the global Employee items
    await setup(['Admin'], '/admin/overview');
    const links = component.filteredMenuItems.map(i => i.link);
    expect(links).not.toContain('/admin/my-assets'); // Admin's own should be removed
    expect(links).toContain('/employee/employee-assets'); // Global one should be there
    expect(links).toContain('/employee/employee-overview');
  });

  it('should show Employee items for user with no roles (default fallback)', async () => {
    // AuthService.getRoles() should return ['Employee'] as fallback
    // In our mock, we need to pass [] to simulate no roles
    await setup([], '/employee/employee-overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Assets');
  });
});
