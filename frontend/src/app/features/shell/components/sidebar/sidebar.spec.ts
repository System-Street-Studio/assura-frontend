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
    await setup(['ADMIN']);
    expect(component).toBeTruthy();
  });

  it('should show Admin items when on /admin path', async () => {
    await setup(['ADMIN'], '/admin/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Assets');
    expect(labels).toContain('Track Assets');
    expect(labels).not.toContain('PO'); // Procurement item
  });

  it('should show Procurement items when on /procurement path', async () => {
    await setup(['PROCUREMENT'], '/procurement/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('PO');
    expect(labels).toContain('Suppliers');
    expect(labels).not.toContain('Track Assets'); // Admin item
  });

  it('should show Procurement items for ADMIN on /procurement path', async () => {
    await setup(['ADMIN'], '/procurement/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('PO');
    expect(labels).not.toContain('Track Assets');
  });

  it('should show general items when on root path', async () => {
    await setup(['ADMIN'], '/overview');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Global Overview');
    expect(labels).not.toContain('Dashboard'); // Admin section item
    expect(labels).not.toContain('PO'); // Procurement section item
  });

  it('should toggle isCollapsed when toggleMenu is called', async () => {
    await setup(['ADMIN']);
    expect(component.isCollapsed).toBeFalse();
    component.toggleMenu();
    expect(component.isCollapsed).toBeTrue();
    component.toggleMenu();
    expect(component.isCollapsed).toBeFalse();
  });
});
