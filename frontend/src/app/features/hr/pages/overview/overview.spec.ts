import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { HrOverviewComponent } from './overview';
import { HrAssignmentService } from '../../services/hr-assignment.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('HrOverviewComponent', () => {
  let component: HrOverviewComponent;
  let fixture: ComponentFixture<HrOverviewComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setup(firstName: string | null) {
    const hrAssignmentServiceSpy = jasmine.createSpyObj('HrAssignmentService', ['getOverview', 'getAssignedUsers'], {
      overview: signal(null),
      assignedUsers: signal([])
    });
    hrAssignmentServiceSpy.getOverview.and.returnValue(of(null));
    hrAssignmentServiceSpy.getAssignedUsers.and.returnValue(of([]));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getFirstName']);
    authServiceSpy.getFirstName.and.returnValue(firstName);

    TestBed.configureTestingModule({
      imports: [HrOverviewComponent],
      providers: [
        { provide: HrAssignmentService, useValue: hrAssignmentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(HrOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // Covers the BUGS.md finding: firstName was hardcoded to the static string
  // 'HR Manager', so the welcome banner never reflected the logged-in HR user.
  it('should greet the logged-in user by their actual first name from the JWT', () => {
    setup('Aruni');
    expect(component.firstName).toBe('Aruni');
  });

  it('should fall back to a generic label when no first name is available', () => {
    setup(null);
    expect(component.firstName).toBe('HR Manager');
  });
});
