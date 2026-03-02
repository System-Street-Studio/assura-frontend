import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  function setup(role: string | null) {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole', 'hasRole']);
    mockAuthService.getRole.and.returnValue(role);

    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup('ADMIN');
    expect(component).toBeTruthy();
  });

  it('should always show ANY items regardless of role', async () => {
    await setup('HR');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('My Assets');
  });

  it('should show PROCUREMENT items for PROCUREMENT role', async () => {
    await setup('PROCUREMENT');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Suppliers');
    expect(labels).toContain('PO');
    expect(labels).toContain('Maintenance');
  });

  it('should not show AUDITOR items for PROCUREMENT role', async () => {
    await setup('PROCUREMENT');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).not.toContain('Reports');
    expect(labels).not.toContain('Audit Logs');
    expect(labels).not.toContain('Export');
  });

  it('should only show ANY items when role is null', async () => {
    await setup(null);
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toEqual(['Overview', 'My Assets']);
  });

  it('should show all items for ADMIN role', async () => {
    await setup('ADMIN');
    const labels = component.filteredMenuItems.map(i => i.label);
    expect(labels).toContain('Assets');
    expect(labels).toContain('Products');
    expect(labels).toContain('Suppliers');
    expect(labels).toContain('Track Assets');
  });

  it('should toggle isCollapsed when toggleMenu is called', async () => {
    await setup('ADMIN');
    expect(component.isCollapsed).toBeFalse();
    component.toggleMenu();
    expect(component.isCollapsed).toBeTrue();
    component.toggleMenu();
    expect(component.isCollapsed).toBeFalse();
  });
});
