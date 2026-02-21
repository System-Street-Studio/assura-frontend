import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  async function setup(role: string | null) {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole']);
    mockAuthService.getRole.and.returnValue(role);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup('STOREKEEPER');
    expect(component).toBeTruthy();
  });

  it('should display the role from AuthService', async () => {
    await setup('PROCUREMENT');
    expect(component.roleName).toBe('PROCUREMENT');
  });

  it('should display "Guest" when AuthService returns null', async () => {
    await setup(null);
    expect(component.roleName).toBe('Guest');
  });

  it('should render role name in the template', async () => {
    await setup('AUDITOR');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.role-name')?.textContent?.trim()).toBe('AUDITOR');
  });
});
